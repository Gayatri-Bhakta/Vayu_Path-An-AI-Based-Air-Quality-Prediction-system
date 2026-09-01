import math
import httpx
import logging
import json

logger = logging.getLogger(__name__)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Haversine distance in kilometers between two geo-coordinates."""
    R = 6371.0  # Earth's radius in km

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c


def get_idw_aqi(lat: float, lng: float, stations: list, power: float = 2.0) -> float:
    """Estimates AQI at a coordinate using Inverse Distance Weighting from station readings."""
    total_weight = 0.0
    weighted_sum = 0.0

    for s in stations:
        # Avoid zero-division by checking if coordinates are extremely close (under ~50 meters)
        dist = haversine_distance(lat, lng, s["lat"], s["lng"])
        if dist < 0.05:
            return float(s["aqi"])

        weight = 1.0 / (dist ** power)
        weighted_sum += weight * float(s["aqi"])
        total_weight += weight

    if total_weight == 0.0:
        return 150.0  # Fallback average AQI

    return weighted_sum / total_weight


def downsample_coordinates(coordinates: list, max_points: int = 50) -> list:
    """Downsamples coordinate path list to limit IDW interpolation computations."""
    n = len(coordinates)
    if n <= max_points:
        return coordinates

    indices = [int(i * (n - 1) / (max_points - 1)) for i in range(max_points)]
    return [coordinates[i] for i in indices]


def get_fallback_route(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> dict:
    """Creates a mock straight-line path route option in case OSRM is offline."""
    dist_km = haversine_distance(start_lat, start_lng, end_lat, end_lng)
    dist_m = dist_km * 1000.0
    # Estimate duration at 40 km/h average speed in seconds
    duration_s = dist_m / (40.0 * 1000.0 / 3600.0)

    # Compile 10 steps along straight line
    coords = []
    for i in range(10):
        t = i / 9.0
        lat = start_lat + t * (end_lat - start_lat)
        lng = start_lng + t * (end_lng - start_lng)
        coords.append([lng, lat])

    return {
        "distance": dist_m,
        "duration": duration_s,
        "geometry": {
            "type": "LineString",
            "coordinates": coords
        }
    }


_osrm_cache = {}

async def fetch_osrm_routes(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> list:
    """Fetches driving routes and alternatives from public OSRM API with memory cache."""
    cache_key = (round(start_lat, 4), round(start_lng, 4), round(end_lat, 4), round(end_lng, 4))
    if cache_key in _osrm_cache:
        return _osrm_cache[cache_key]

    url = f"http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}"
    params = {
        "alternatives": "true",
        "geometries": "geojson",
        "overview": "full"
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(url, params=params)
            if res.status_code == 200:
                routes = res.json().get("routes", [])
                if routes:
                    _osrm_cache[cache_key] = routes
                    return routes
            else:
                logger.warning(f"OSRM returned status {res.status_code}, using fallback route.")
    except Exception as e:
        logger.error(f"Error querying OSRM: {e}. Using straight line fallback.")

    fallback = [get_fallback_route(start_lat, start_lng, end_lat, end_lng)]
    return fallback


def score_routes(raw_routes: list, stations: list, threshold: int = None) -> list:
    """Applies IDW scoring along each route, flags threshold exceedances and eco/fastest paths."""
    route_options = []

    for r in raw_routes:
        geom = r.get("geometry", {})
        coords = geom.get("coordinates", [])
        
        # Sample points along the route to perform IDW
        sampled = downsample_coordinates(coords, 50)
        point_aqis = [get_idw_aqi(pt[1], pt[0], stations) for pt in sampled]
        
        avg_aqi = sum(point_aqis) / len(point_aqis) if point_aqis else 150.0
        
        does_exceed = False
        if threshold is not None:
            does_exceed = any(aqi > threshold for aqi in point_aqis)

        route_options.append({
            "distance_m": float(r.get("distance", 0)),
            "duration_s": float(r.get("duration", 0)),
            "exposure_aqi": round(avg_aqi, 1),
            "route_geometry": json.dumps(coords),
            "does_exceed_threshold": does_exceed,
            "is_eco_path": False,
            "is_fastest_path": False
        })

    if not route_options:
        return []

    # Identify Eco-Path (minimum AQI exposure)
    eco_idx = min(range(len(route_options)), key=lambda idx: route_options[idx]["exposure_aqi"])
    route_options[eco_idx]["is_eco_path"] = True

    # Identify Fastest Path (minimum duration)
    fast_idx = min(range(len(route_options)), key=lambda idx: route_options[idx]["duration_s"])
    route_options[fast_idx]["is_fastest_path"] = True

    return route_options
