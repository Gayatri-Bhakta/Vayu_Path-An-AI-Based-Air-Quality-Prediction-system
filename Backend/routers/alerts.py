from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from database import get_db
from models import User, HealthProfile, AlertLog
from schemas import AlertResponse, AlertCheckRequest
from auth import get_current_user
from cpcb_service import get_station_by_id_or_name, update_stations_from_openaq
from LSTM_services import run_lstm_forecast

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])


def get_band_label(aqi: int) -> str:
    """Helper to categorize AQI value into a human-readable band."""
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 200:
        return "Poor"
    if aqi <= 300:
        return "Very Poor"
    return "Severe"


@router.get("", response_model=List[AlertResponse])
def get_alerts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieves all alert notifications for the authenticated user, sorted by most recent."""
    alerts = db.query(AlertLog).filter(AlertLog.user_id == user.id).order_by(AlertLog.created_at.desc()).limit(30).all()
    return alerts


@router.post("/check", response_model=List[AlertResponse])
async def check_forecast_threshold(payload: AlertCheckRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Runs the LSTM forecast for the specified station, checks it against the
    user's sensitivity threshold, logs new alerts if breached, and returns them.
    """
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    if not profile or not profile.alerts_enabled:
        return []

    threshold = profile.aqi_threshold

    # 1. Fetch latest station data and run LSTM forecast
    await update_stations_from_openaq()
    try:
        st_data = get_station_by_id_or_name(payload.station_name)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station '{payload.station_name}' not found."
        )

    forecast = await run_lstm_forecast(st_data["name"], st_data)
    new_alerts = []

    # 2. Check each forecast horizon step (+1h, +6h, +12h, +24h)
    for step in forecast:
        predicted_aqi = step["aqi"]
        horizon = step["horizon"]

        if predicted_aqi > threshold:
            # Check for duplicate alerts created within the last 12 hours for the same horizon & station
            twelve_hours_ago = datetime.utcnow() - timedelta(hours=12)
            duplicate = db.query(AlertLog).filter(
                AlertLog.user_id == user.id,
                AlertLog.station_name == st_data["shortName"],
                AlertLog.horizon == horizon,
                AlertLog.created_at >= twelve_hours_ago
            ).first()

            if not duplicate:
                band = get_band_label(predicted_aqi)
                message = f"Alert: {st_data['shortName']} AQI is forecasted to reach {predicted_aqi} ({band}) in {horizon} (your profile limit is {threshold})."
                
                db_alert = AlertLog(
                    user_id=user.id,
                    station_name=st_data["shortName"],
                    triggered_aqi=predicted_aqi,
                    threshold_aqi=threshold,
                    horizon=horizon,
                    message=message,
                    is_read=False
                )
                db.add(db_alert)
                new_alerts.append(db_alert)

    if new_alerts:
        db.commit()
        # Refresh all newly created alerts to ensure they get database-assigned IDs
        for alert in new_alerts:
            db.refresh(alert)

    return new_alerts


@router.put("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(alert_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Marks an alert notification as read."""
    alert = db.query(AlertLog).filter(AlertLog.id == alert_id, AlertLog.user_id == user.id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert notification not found."
        )

    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/clear")
def clear_alerts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Clears all alert history logs for the authenticated user."""
    db.query(AlertLog).filter(AlertLog.user_id == user.id).delete()
    db.commit()
    return {"message": "All alert notifications cleared."}
