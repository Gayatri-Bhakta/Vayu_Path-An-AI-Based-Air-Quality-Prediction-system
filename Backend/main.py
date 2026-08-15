from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers.auth import router as auth_router

# Import Dashboard Services
from cpcb_service import get_all_stations, get_station_by_id_or_name
from weather_services import fetch_live_weather
from LSTM_services import run_lstm_forecast


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Air Quality Prediction Backend",
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include existing authentication router
app.include_router(auth_router)


# Root check
@app.get("/")
def root():
    return {
        "message": "Air Quality Prediction Backend is running"
    }


# =========================================================
# DASHBOARD API ENDPOINTS
# =========================================================

@app.get("/api/dashboard/stations")
def list_stations():
    """Returns the list of all Delhi monitoring stations with coordinates and base AQI."""
    return {"stations": get_all_stations()}


@app.get("/api/dashboard/weather")
async def get_weather(lat: float = Query(28.6139), lng: float = Query(77.2090)):
    """Fetches real-time weather from Open-Meteo for the given coordinates."""
    return await fetch_live_weather(lat, lng)


@app.get("/api/dashboard/forecast")
async def get_station_forecast(station: str = Query("Alipur, Delhi - DPCC")):
    """
    Fetches weather and runs the trained LSTM model (+1h, +6h, +12h, +24h)
    for the selected monitoring station.
    """
    st_data = get_station_by_id_or_name(station)
    weather = await fetch_live_weather(st_data["lat"], st_data["lng"])
    forecast = run_lstm_forecast(st_data["name"], st_data)
    
    return {
        "station": st_data,
        "weather": weather,
        "forecast": forecast
    }