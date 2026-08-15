import os
import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")

MODEL_PATH = os.path.join(MODELS_DIR, "aqi_lstm.keras")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")
TARGET_SCALER_PATH = os.path.join(MODELS_DIR, "target_scaler.pkl")
CONFIG_PATH = os.path.join(MODELS_DIR, "feature_config.json")

# Artifact cache
_model = None
_feature_scaler = None
_target_scaler = None
_config = None
_feature_cols = []
_station_cols = []


def load_artifacts():
    """Lazily loads and caches model and scaler artifacts."""
    global _model, _feature_scaler, _target_scaler, _config, _feature_cols, _station_cols
    
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _model = tf.keras.models.load_model(MODEL_PATH)
        _feature_scaler = joblib.load(SCALER_PATH)
        _target_scaler = joblib.load(TARGET_SCALER_PATH)
        
        with open(CONFIG_PATH, "r") as f:
            _config = json.load(f)
            
        _feature_cols = _config.get("feature_cols", [])
        _station_cols = _config.get("station_cols", [])


def get_time_features(dt: datetime) -> dict:
    """Computes cyclical time features for a given datetime."""
    return {
        "hour_sin": np.sin(2 * np.pi * dt.hour / 24.0),
        "hour_cos": np.cos(2 * np.pi * dt.hour / 24.0),
        "dow_sin": np.sin(2 * np.pi * dt.weekday() / 7.0),
        "dow_cos": np.cos(2 * np.pi * dt.weekday() / 7.0),
        "month_sin": np.sin(2 * np.pi * (dt.month - 1) / 12.0),
        "month_cos": np.cos(2 * np.pi * (dt.month - 1) / 12.0),
    }


def build_feature_frame(station_name: str, readings: dict, now: datetime) -> pd.DataFrame:
    """Builds a DataFrame matching FEATURE_COLS structure for the 24h sequence."""
    rows = []
    # Normalize station naming to match one-hot columns (e.g., station_central_delhi)
    normalized_station = station_name.strip().lower().replace(" ", "_")
    station_col_key = f"station_{normalized_station}"

    # Default fallback values if sensor reading keys are missing
    base_readings = {
        "pm25": float(readings.get("pm25") or readings.get("pm2_5") or 100.0),
        "pm10": float(readings.get("pm10") or 180.0),
        "no2": float(readings.get("no2") or 30.0),
        "co": float(readings.get("co") or 1.2),
        "o3": float(readings.get("o3") or 20.0),
        "aqi": float(readings.get("aqi") or 200.0),
    }

    for h in range(24, 0, -1):
        step_dt = now - timedelta(hours=h)
        row_dict = base_readings.copy()
        
        # Add cyclical time features
        row_dict.update(get_time_features(step_dt))
        
        # Add one-hot encoded station features
        for col in _station_cols:
            row_dict[col] = 1.0 if col == station_col_key else 0.0
            
        rows.append(row_dict)

    df = pd.DataFrame(rows)
    
    # Fill any missing columns defined in config with 0.0 to prevent indexing errors
    for col in _feature_cols:
        if col not in df.columns:
            df[col] = 0.0

    return df[_feature_cols]


def format_time_label(now: datetime, offset_hours: int) -> str:
    """Formats output time label cleanly across different OS environments."""
    target = now + timedelta(hours=offset_hours)
    # Uses %I:%M %p and removes leading zero safely
    time_str = target.strftime("%I:%M %p")
    return time_str[1:] if time_str.startswith("0") else time_str


def run_lstm_forecast(station_name: str, readings: dict) -> list[dict]:
    """Runs LSTM inference for +1h, +6h, +12h, and +24h horizons."""
    load_artifacts()
    now = datetime.now()
    
    # 1. Construct and scale input sequence
    df_features = build_feature_frame(station_name, readings, now)
    X_scaled = _feature_scaler.transform(df_features).reshape(1, 24, len(_feature_cols))

    # 2. Predict and inverse scale
    y_pred_scaled = _model.predict(X_scaled, verbose=0)
    
    # Handle single-target or multi-output shape variations
    if y_pred_scaled.ndim == 1:
        y_pred_scaled = y_pred_scaled.reshape(1, -1)
        
    y_pred = _target_scaler.inverse_transform(y_pred_scaled).flatten()

    # 3. Format output horizons (+1h, +6h, +12h, +24h)
    horizons = [(1, "+1h"), (6, "+6h"), (12, "+12h"), (24, "+24h")]
    
    forecasts = []
    for i, (offset, label) in enumerate(horizons):
        # Fallback to last available predicted index if model output length differs
        pred_val = float(y_pred[i]) if i < len(y_pred) else float(y_pred[-1])
        forecasts.append({
            "horizon": label,
            "time": format_time_label(now, offset),
            "aqi": max(10, min(500, round(pred_val)))  # Bound between standard AQI limits (10-500)
        })

    return forecasts