from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: Optional[str] = None
    confirm_password: Optional[str] = None



class HealthProfileCreate(BaseModel):
    sensitivity: str
    aqi_threshold: int
    alerts_enabled: bool = True


class HealthProfileResponse(BaseModel):
    id: int
    user_id: int
    sensitivity: str
    aqi_threshold: int
    alerts_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RouteSearchRequest(BaseModel):
    start_name: str
    end_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    departure_offset: str = "now"  # now, +1h, +6h, +12h, +24h


class RouteOption(BaseModel):
    distance_m: float
    duration_s: float
    exposure_aqi: float
    route_geometry: str  # JSON string representing coordinates
    is_eco_path: bool = False
    is_fastest_path: bool = False
    does_exceed_threshold: bool = False


class RouteSearchResponse(BaseModel):
    routes: List[RouteOption]
    health_threshold: Optional[int] = None
    sensitivity: Optional[str] = None


class RouteHistoryResponse(BaseModel):
    id: int
    start_name: str
    end_name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    departure_offset: str
    distance_m: float
    duration_s: float
    exposure_aqi: float
    created_at: datetime

    class Config:
        from_attributes = True


class AlertCheckRequest(BaseModel):
    station_name: str


class AlertResponse(BaseModel):
    id: int
    station_name: str
    triggered_aqi: int
    threshold_aqi: int
    horizon: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
