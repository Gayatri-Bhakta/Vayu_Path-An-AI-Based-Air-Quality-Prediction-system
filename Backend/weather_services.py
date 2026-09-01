import httpx
from datetime import datetime, timedelta

# In-memory caches
_weather_cache = {}  # key: (rounded_lat, rounded_lng), value: (timestamp, weather_dict)
_last_batch_weather_fetch = None

async def fetch_live_weather(lat: float, lng: float):
    """Fetches real-time weather from Open-Meteo with 15-minute caching."""
    global _weather_cache
    now = datetime.now()
    cache_key = (round(lat, 3), round(lng, 3))
    
    if cache_key in _weather_cache:
        cached_time, cached_weather = _weather_cache[cache_key]
        if (now - cached_time) < timedelta(minutes=15):
            print(f"[Weather Service] Returning cached weather for {cache_key}")
            return cached_weather
            
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json().get("current", {})
                result = {
                    "temperature": round(data.get("temperature_2m", 30.5), 1),
                    "humidity": int(data.get("relative_humidity_2m", 65)),
                    "wind_speed": round(data.get("wind_speed_10m", 1.2), 1),
                    "status": "Online"
                }
                _weather_cache[cache_key] = (now, result)
                return result
    except Exception:
        pass
        
    fallback = {"temperature": 30.5, "humidity": 65, "wind_speed": 1.2, "status": "Estimated"}
    return fallback

async def fetch_batch_weather(stations: list):
    """Queries Open-Meteo in a single batch request for all coordinates with 15-minute caching."""
    global _last_batch_weather_fetch
    now = datetime.now()
    
    # If we already have batch-fetched weather within 15 minutes and all stations have weather data, skip
    if _last_batch_weather_fetch and (now - _last_batch_weather_fetch) < timedelta(minutes=15):
        if all("weather" in s for s in stations):
            print("[Weather Service] Returning cached batch weather for all stations")
            return
            
    if not stations:
        return
        
    lats = [str(s["lat"]) for s in stations]
    lngs = [str(s["lng"]) for s in stations]
    lat_str = ",".join(lats)
    lng_str = ",".join(lngs)
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat_str}&longitude={lng_str}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    
    wmo_map = {
        0: "Clear Sky",
        1: "Partly Cloudy", 2: "Partly Cloudy", 3: "Partly Cloudy",
        45: "Foggy", 48: "Foggy",
        51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
        56: "Freezing Drizzle", 57: "Freezing Drizzle",
        61: "Light Rain", 63: "Rainy", 65: "Heavy Rain",
        66: "Freezing Rain", 67: "Freezing Rain",
        71: "Snowy", 73: "Snowy", 75: "Heavy Snow",
        77: "Snow Grains",
        80: "Light Drizzle", 81: "Rain Showers", 82: "Heavy Showers",
        85: "Snow Showers", 86: "Snow Showers",
        95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Thunderstorm with Hail"
    }
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data_list = res.json()
                if not isinstance(data_list, list):
                    data_list = [data_list]
                    
                for idx, s in enumerate(stations):
                    if idx < len(data_list):
                        curr = data_list[idx].get("current", {})
                        w_code = curr.get("weather_code", 0)
                        s["weather"] = {
                            "temperature": round(curr.get("temperature_2m", 27.0), 1),
                            "humidity": int(curr.get("relative_humidity_2m", 65)),
                            "wind_speed": round(curr.get("wind_speed_10m", 0.6), 2),
                            "desc": wmo_map.get(w_code, "Partly Cloudy")
                        }
                        
                        # Populate individual coordinate cache as well to speed up individual clicks!
                        cache_key = (round(s["lat"], 3), round(s["lng"], 3))
                        _weather_cache[cache_key] = (now, {
                            "temperature": s["weather"]["temperature"],
                            "humidity": s["weather"]["humidity"],
                            "wind_speed": s["weather"]["wind_speed"],
                            "status": "Online"
                        })
                    else:
                        s["weather"] = {
                            "temperature": 27.0,
                            "humidity": 65,
                            "wind_speed": 0.6,
                            "desc": "Partly Cloudy"
                        }
                _last_batch_weather_fetch = now
            else:
                for s in stations:
                    s["weather"] = {
                        "temperature": 27.0,
                        "humidity": 65,
                        "wind_speed": 0.6,
                        "desc": "Partly Cloudy"
                    }
    except Exception:
        for s in stations:
            s["weather"] = {
                "temperature": 27.0,
                "humidity": 65,
                "wind_speed": 0.6,
                "desc": "Partly Cloudy"
            }
