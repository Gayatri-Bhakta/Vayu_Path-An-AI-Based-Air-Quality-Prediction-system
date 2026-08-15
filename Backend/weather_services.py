import httpx

async def fetch_live_weather(lat: float, lng: float):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json().get("current", {})
                return {
                    "temperature": round(data.get("temperature_2m", 30.5), 1),
                    "humidity": int(data.get("relative_humidity_2m", 65)),
                    "wind_speed": round(data.get("wind_speed_10m", 1.2), 1),
                    "status": "Online"
                }
    except Exception:
        pass
    return {"temperature": 30.5, "humidity": 65, "wind_speed": 1.2, "status": "Estimated"}