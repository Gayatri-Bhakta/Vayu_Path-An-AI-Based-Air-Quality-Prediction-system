from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, HealthProfile, Route
from schemas import (
    HealthProfileCreate, HealthProfileResponse,
    RouteSearchRequest, RouteSearchResponse, RouteOption,
    RouteHistoryResponse
)
from auth import get_current_user, get_optional_current_user
from route_services import fetch_osrm_routes, score_routes
from LSTM_services import get_stations_aqi_for_horizon

router = APIRouter(prefix="/routes", tags=["Routes & Health Profiles"])


@router.get("/health-profile", response_model=HealthProfileResponse)
def get_health_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieves the health profile of the logged-in user."""
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    if not profile:
        # Create a default profile if none exists
        profile = HealthProfile(
            user_id=user.id,
            sensitivity="general",
            aqi_threshold=150,
            alerts_enabled=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/health-profile", response_model=HealthProfileResponse)
def update_health_profile(payload: HealthProfileCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Creates or updates the health profile of the logged-in user."""
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
    if not profile:
        profile = HealthProfile(user_id=user.id)
        db.add(profile)
    
    profile.sensitivity = payload.sensitivity
    profile.aqi_threshold = payload.aqi_threshold
    profile.alerts_enabled = payload.alerts_enabled
    
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/search", response_model=RouteSearchResponse)
async def search_routes(payload: RouteSearchRequest, user: User = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    """
    Fetches alternative OSRM routes, scores them using IDW interpolation,
    optionally matches against user health thresholds, ranks them,
    and logs the eco-path route in search history if logged in.
    """
    threshold = None
    sensitivity = None

    # Retrieve threshold if user is authenticated and has profile
    if user:
        profile = db.query(HealthProfile).filter(HealthProfile.user_id == user.id).first()
        if profile:
            threshold = profile.aqi_threshold
            sensitivity = profile.sensitivity

    # 1. Fetch forecasted/live station readings based on departure window
    stations = await get_stations_aqi_for_horizon(payload.departure_offset)

    # 2. Query routes from OSRM
    raw_routes = await fetch_osrm_routes(
        payload.start_lat, payload.start_lng,
        payload.end_lat, payload.end_lng
    )
    if not raw_routes:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not retrieve routes from OSRM mapping service."
        )

    # 3. Score routes using IDW
    scored_options = score_routes(raw_routes, stations, threshold=threshold)

    # 4. Save eco-route to history if logged in
    if user and scored_options:
        eco_route = next((r for r in scored_options if r["is_eco_path"]), scored_options[0])
        db_route = Route(
            user_id=user.id,
            start_name=payload.start_name,
            end_name=payload.end_name,
            start_lat=payload.start_lat,
            start_lng=payload.start_lng,
            end_lat=payload.end_lat,
            end_lng=payload.end_lng,
            departure_offset=payload.departure_offset,
            distance_m=eco_route["distance_m"],
            duration_s=eco_route["duration_s"],
            exposure_aqi=eco_route["exposure_aqi"],
            route_geometry=eco_route["route_geometry"]
        )
        db.add(db_route)
        db.commit()

    # Convert dict options to RouteOption schemas
    routes_list = [RouteOption(**r) for r in scored_options]

    return RouteSearchResponse(
        routes=routes_list,
        health_threshold=threshold,
        sensitivity=sensitivity
    )


@router.get("/history", response_model=List[RouteHistoryResponse])
def get_route_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieves route search history for the authenticated user, sorted by most recent."""
    history = db.query(Route).filter(Route.user_id == user.id).order_by(Route.created_at.desc()).limit(15).all()
    return history
