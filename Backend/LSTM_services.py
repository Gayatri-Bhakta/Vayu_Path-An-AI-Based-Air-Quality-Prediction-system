import os
import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import asyncio
import httpx
import logging
from datetime import datetime, timedelta
from cpcb_service import OPENAQ_API_KEY

logger = logging.getLogger(__name__)

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
_forecast_cache = {}
_forecast_cache_timed = {}
_batch_predict_time = None
_batch_predict_results = None
_horizon_batch_cache = {}

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


async def fetch_sensor_history_24h(sensor_id: int) -> dict:
    """Fetches the last 24 hours of measurements for a sensor."""
    now = datetime.now()
    dt_from = (now - timedelta(hours=25)).strftime("%Y-%m-%dT%H:%M:%SZ")
    dt_to = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    url = f"https://api.openaq.org/v3/sensors/{sensor_id}/hours?datetimeFrom={dt_from}&datetimeTo={dt_to}&limit=100"
    headers = {}
    if OPENAQ_API_KEY:
        headers["X-API-Key"] = OPENAQ_API_KEY
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                results = res.json().get("results", [])
                history = {}
                for item in results:
                    val = item.get("value")
                    period = item.get("period", {})
                    dt_str = period.get("datetimeFrom", {}).get("local")
                    if dt_str and val is not None:
                        try:
                            dt_parsed = datetime.fromisoformat(dt_str)
                            history[dt_parsed.hour] = val
                        except Exception:
                            pass
                print(f"[Air Quality Prediction] Sensor {sensor_id} returned {len(history)} hours of data")
                return history
            else:
                print(f"[Air Quality Prediction] Sensor {sensor_id} history request failed with status: {res.status_code}")
    except Exception as e:
        logger.error(f"Error fetching sensor history for sensor {sensor_id}: {e}")
    return {}

async def get_station_history_table(s_data: dict, now: datetime) -> dict:
    """Fetches the 24-hour history for all 5 pollutant sensors of the station in parallel."""
    sensors = s_data.get("sensors", {})
    params = ["pm25", "pm10", "no2", "co", "o3"]
    
    tasks = []
    param_list = []
    
    for p in params:
        sensor_id = sensors.get(p)
        if sensor_id:
            tasks.append(fetch_sensor_history_24h(sensor_id))
            param_list.append(p)
            
    print(f"[Air Quality Prediction] Fetching parallel history for {s_data.get('shortName')} sensors: {sensors}")
    histories = await asyncio.gather(*tasks)
    
    # Map histories to param
    param_histories = {}
    for p, hist in zip(param_list, histories):
        param_histories[p] = hist
        
    # Reconstruct the 24 hourly steps matching the range [24, 23, ..., 1] hours ago
    final_table = {p: [] for p in params}
    
    # Base fallback values
    base_readings = {
        "pm25": float(s_data.get("pm25") or 100.0),
        "pm10": float(s_data.get("pm10") or 180.0),
        "no2": float(s_data.get("no2") or 30.0),
        "co": float(s_data.get("co") or 1.2),
        "o3": float(s_data.get("o3") or 20.0),
    }
    
    history_source_counts = {p: 0 for p in params}
    for h in range(24, 0, -1):
        step_dt = now - timedelta(hours=h)
        step_hour = step_dt.hour
        
        for p in params:
            hist = param_histories.get(p, {})
            val = hist.get(step_hour)
            if val is not None:
                final_table[p].append(float(val))
                history_source_counts[p] += 1
            else:
                final_table[p].append(base_readings[p])
                
    print(f"[Air Quality Prediction] Station {s_data.get('shortName')} history constructed. Hours fetched: {history_source_counts}")
    return final_table

def build_feature_frame(station_name: str, history_table: dict, s_data: dict, now: datetime) -> pd.DataFrame:
    """Builds a DataFrame matching FEATURE_COLS structure using the real 24h history."""
    rows = []
    normalized_station = station_name.strip().lower().replace(" ", "_")
    station_col_key = f"station_{normalized_station}"

    for i in range(24):
        row_dict = {
            "pm25": history_table["pm25"][i],
            "pm10": history_table["pm10"][i],
            "no2": history_table["no2"][i],
            "co": history_table["co"][i],
            "o3": history_table["o3"][i],
        }
        
        # Recalculate PM2.5 and PM10 sub-indices
        pm25_val = row_dict["pm25"]
        pm10_val = row_dict["pm10"]
        if pm25_val <= 30:
            sub_pm25 = (pm25_val * 50) / 30
        elif pm25_val <= 60:
            sub_pm25 = 50 + ((pm25_val - 30) * 50) / 30
        elif pm25_val <= 90:
            sub_pm25 = 100 + ((pm25_val - 60) * 100) / 30
        elif pm25_val <= 120:
            sub_pm25 = 200 + ((pm25_val - 90) * 100) / 30
        elif pm25_val <= 250:
            sub_pm25 = 300 + ((pm25_val - 120) * 100) / 130
        else:
            sub_pm25 = 400 + ((pm25_val - 250) * 100) / 250
            
        if pm10_val <= 50:
            sub_pm10 = pm10_val
        elif pm10_val <= 100:
            sub_pm10 = 50 + ((pm10_val - 50) * 50) / 50
        elif pm10_val <= 250:
            sub_pm10 = 100 + ((pm10_val - 100) * 100) / 150
        elif pm10_val <= 350:
            sub_pm10 = 200 + ((pm10_val - 250) * 100) / 100
        elif pm10_val <= 430:
            sub_pm10 = 300 + ((pm10_val - 350) * 100) / 80
        else:
            sub_pm10 = 400 + ((pm10_val - 430) * 100) / 70
            
        calculated_aqi = max(sub_pm25, sub_pm10)
        row_dict["aqi"] = min(500, max(10, round(calculated_aqi)))
        
        # Cyclical time features
        step_dt = now - timedelta(hours=(24 - i))
        row_dict.update(get_time_features(step_dt))
        
        # One-hot station features
        for col in _station_cols:
            row_dict[col] = 1.0 if col == station_col_key else 0.0
            
        rows.append(row_dict)

    df = pd.DataFrame(rows)
    for col in _feature_cols:
        if col not in df.columns:
            df[col] = 0.0

    return df[_feature_cols]

def format_time_label(now: datetime, offset_hours: int) -> str:
    """Formats output time label cleanly across different OS environments."""
    target = now + timedelta(hours=offset_hours)
    time_str = target.strftime("%I:%M %p")
    return time_str[1:] if time_str.startswith("0") else time_str

async def run_lstm_forecast(station_name: str, readings: dict) -> list[dict]:
    """Runs LSTM inference for +1h, +6h, +12h, and +24h horizons with 10-minute caching."""
    global _forecast_cache_timed, _forecast_cache
    now = datetime.now()
    
    # Check 10-minute cache first
    if station_name in _forecast_cache_timed:
        cache_time, cached_forecast = _forecast_cache_timed[station_name]
        if (now - cache_time) < timedelta(minutes=10):
            print(f"[LSTM Service] Returning cached 10-min forecast for {station_name}")
            return cached_forecast

    load_artifacts()
    
    # 1. Fetch real historical 24-hour pollutant measurements
    history_table = await get_station_history_table(readings, now)
    
    # 2. Construct and scale input sequence
    df_features = build_feature_frame(station_name, history_table, readings, now)
    X_scaled = _feature_scaler.transform(df_features).reshape(1, 24, len(_feature_cols))

    # 3. Predict and inverse scale
    y_pred_scaled = _model.predict(X_scaled, verbose=0)
    if y_pred_scaled.ndim == 1:
        y_pred_scaled = y_pred_scaled.reshape(1, -1)
        
    y_pred = _target_scaler.inverse_transform(y_pred_scaled).flatten()

    # 4. Format output horizons (+1h, +6h, +12h, +24h)
    horizons = [(1, "+1h"), (6, "+6h"), (12, "+12h"), (24, "+24h")]
    
    forecasts = []
    for i, (offset, label) in enumerate(horizons):
        pred_val = float(y_pred[i]) if i < len(y_pred) else float(y_pred[-1])
        forecasts.append({
            "horizon": label,
            "time": format_time_label(now, offset),
            "aqi": max(10, min(500, round(pred_val)))
        })

    _forecast_cache[station_name] = forecasts
    _forecast_cache_timed[station_name] = (now, forecasts)
    return forecasts

def estimate_pm25_from_aqi(aqi: float) -> float:
    """CPCB standard PM2.5 estimation back-calculation from AQI sub-index."""
    if aqi <= 50:
        return (aqi * 30.0) / 50.0
    elif aqi <= 100:
        return 30.0 + ((aqi - 50.0) * 30.0) / 50.0
    elif aqi <= 200:
        return 60.0 + ((aqi - 100.0) * 30.0) / 100.0
    elif aqi <= 300:
        return 90.0 + ((aqi - 200.0) * 30.0) / 100.0
    elif aqi <= 400:
        return 120.0 + ((aqi - 300.0) * 130.0) / 100.0
    else:
        return 250.0 + ((aqi - 400.0) * 250.0) / 100.0

async def predict_all_stations(stations: list):
    """Runs high-performance batch inference for all 36 stations using their current live metrics."""
    global _batch_predict_time, _batch_predict_results, _forecast_cache
    now = datetime.now()
    
    # If cached recently (within 5 minutes), apply cached values directly
    if _batch_predict_time and _batch_predict_results and (now - _batch_predict_time) < timedelta(minutes=5):
        for s in stations:
            s_name = s.get("name")
            if s_name in _batch_predict_results:
                s["aqi"] = _batch_predict_results[s_name]["aqi"]
                s["pm25"] = _batch_predict_results[s_name]["pm25"]
        return
        
    load_artifacts()
    
    params = ["pm25", "pm10", "no2", "co", "o3"]
    dfs = []
    
    for s in stations:
        base_readings = {
            "pm25": float(s.get("pm25") or 100.0),
            "pm10": float(s.get("pm10") or 180.0),
            "no2": float(s.get("no2") or 30.0),
            "co": float(s.get("co") or 1.2),
            "o3": float(s.get("o3") or 20.0),
        }
        # Build sequence of flat values matching the latest measurements
        history_table = {p: [base_readings[p]] * 24 for p in params}
        df_feat = build_feature_frame(s["name"], history_table, s, now)
        dfs.append(df_feat)
        
    if not dfs:
        return
        
    # Concatenate all sequences to build batch input tensor
    all_df = pd.concat(dfs, axis=0)
    all_scaled = _feature_scaler.transform(all_df).reshape(len(stations), 24, len(_feature_cols))
    
    # Predict in a single forward pass
    y_pred_scaled = _model.predict(all_scaled, verbose=0)
    if y_pred_scaled.ndim == 1:
        y_pred_scaled = y_pred_scaled.reshape(1, -1)
        
    y_pred = _target_scaler.inverse_transform(y_pred_scaled)
    
    # Map predicted +1h values back to stations AQI and PM2.5 and cache them
    results = {}
    for idx, s in enumerate(stations):
        station_name = s.get("name")
        if station_name in _forecast_cache:
            pred_aqi_1h = float(_forecast_cache[station_name][0]["aqi"])
        else:
            pred_aqi_1h = float(y_pred[idx][0]) if idx < len(y_pred) else 200.0
            
        s["aqi"] = max(10, min(500, round(pred_aqi_1h)))
        s["pm25"] = round(estimate_pm25_from_aqi(s["aqi"]), 1)
        results[station_name] = {"aqi": s["aqi"], "pm25": s["pm25"]}
        
    _batch_predict_results = results
    _batch_predict_time = now


async def predict_all_stations_for_horizon(stations: list, horizon: str) -> list:
    """Runs high-performance batch inference for a specific forecast horizon with caching."""
    global _horizon_batch_cache, _forecast_cache
    now = datetime.now()
    
    if horizon == "now" or not horizon:
        return stations
        
    if horizon in _horizon_batch_cache:
        cached_time, cached_data = _horizon_batch_cache[horizon]
        if (now - cached_time) < timedelta(minutes=5):
            return [dict(s) for s in cached_data]
            
    load_artifacts()
    
    horizon_indices = {
        "+1h": 0,
        "+6h": 1,
        "+12h": 2,
        "+24h": 3
    }
    idx_horizon = horizon_indices.get(horizon, 0)
    
    params = ["pm25", "pm10", "no2", "co", "o3"]
    dfs = []
    
    for s in stations:
        base_readings = {
            "pm25": float(s.get("pm25") or 100.0),
            "pm10": float(s.get("pm10") or 180.0),
            "no2": float(s.get("no2") or 30.0),
            "co": float(s.get("co") or 1.2),
            "o3": float(s.get("o3") or 20.0),
        }
        history_table = {p: [base_readings[p]] * 24 for p in params}
        df_feat = build_feature_frame(s["name"], history_table, s, now)
        dfs.append(df_feat)
        
    if not dfs:
        return stations
        
    all_df = pd.concat(dfs, axis=0)
    all_scaled = _feature_scaler.transform(all_df).reshape(len(stations), 24, len(_feature_cols))
    
    y_pred_scaled = _model.predict(all_scaled, verbose=0)
    if y_pred_scaled.ndim == 1:
        y_pred_scaled = y_pred_scaled.reshape(1, -1)
        
    y_pred = _target_scaler.inverse_transform(y_pred_scaled)
    
    for idx, s in enumerate(stations):
        station_name = s.get("name")
        if station_name in _forecast_cache:
            pred_val = float(_forecast_cache[station_name][idx_horizon]["aqi"])
        else:
            pred_val = float(y_pred[idx][idx_horizon]) if idx < len(y_pred) else 200.0
            
        s["aqi"] = max(10, min(500, round(pred_val)))
        s["pm25"] = round(estimate_pm25_from_aqi(s["aqi"]), 1)
        
    _horizon_batch_cache[horizon] = (now, [dict(s) for s in stations])
    return stations


async def get_stations_aqi_for_horizon(horizon: str) -> list:
    """
    Returns a copy of DELHI_STATIONS with their AQI updated to the requested horizon:
    'now', '+1h', '+6h', '+12h', '+24h'.
    """
    from cpcb_service import get_all_stations, update_stations_from_openaq
    # Trigger background update non-blockingly
    asyncio.create_task(update_stations_from_openaq())
    stations = [dict(s) for s in get_all_stations()]
    return await predict_all_stations_for_horizon(stations, horizon)