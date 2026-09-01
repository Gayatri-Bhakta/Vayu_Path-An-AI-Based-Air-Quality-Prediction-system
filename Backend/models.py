from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)

    last_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, index=True, nullable=False)

    password_hash = Column(String(255), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    health_profile = relationship("HealthProfile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("AlertLog", back_populates="user", cascade="all, delete-orphan")


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    sensitivity = Column(String(50), default="general")  # general, child, elderly, asthmatic, cardio
    aqi_threshold = Column(Integer, default=150)
    alerts_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="health_profile")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # Optional for guest searches
    start_name = Column(String(255), nullable=False)
    end_name = Column(String(255), nullable=False)
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    departure_offset = Column(String(50), default="now")  # now, +1h, +6h, +12h, +24h
    distance_m = Column(Float, nullable=False)
    duration_s = Column(Float, nullable=False)
    exposure_aqi = Column(Float, nullable=False)
    route_geometry = Column(String, nullable=False)  # JSON string of coordinates
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="routes")


class AlertLog(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    station_name = Column(String(255), nullable=False)
    triggered_aqi = Column(Integer, nullable=False)
    threshold_aqi = Column(Integer, nullable=False)
    horizon = Column(String(50), nullable=False)  # +1h, +6h, +12h, +24h
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    category = Column(String(50), nullable=False)  # Bug, Suggestion, UI-UX, Other
    comments = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
