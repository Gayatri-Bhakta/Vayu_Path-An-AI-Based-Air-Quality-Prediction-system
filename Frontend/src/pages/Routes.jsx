import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Navigation, Search, Sliders, AlertTriangle, ShieldAlert, Heart, Clock, MapPin, 
  ChevronRight, ArrowRight, Award, Trash2, Wind, Car, Bike, Footprints
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Band helper matching Dashboard
const getBand = (aqi) => {
  if (aqi <= 100) return { label: "Satisfactory", bg: "#dcfce7", color: "#15803d" };
  if (aqi <= 200) return { label: "Moderate", bg: "#ffedd5", color: "#c2410c" };
  if (aqi <= 300) return { label: "Poor", bg: "#fee2e2", color: "#991b1b" };
  return { label: "Severe", bg: "#fca5a5", color: "#7f1d1d" };
};

const getMarkerColor = (aqi) => {
  if (aqi <= 100) return "#10b981"; // Satisfactory
  if (aqi <= 200) return "#f97316"; // Moderate
  if (aqi <= 300) return "#ef4444"; // Poor
  return "#7f1d1d"; // Severe
};

const getTranslatedLabel = (label, lang) => {
  if (lang === 'hi') {
    if (label === "Satisfactory") return "संतोषजनक";
    if (label === "Moderate") return "मध्यम";
    if (label === "Poor") return "खराब";
    if (label === "Severe") return "गंभीर";
  }
  return label;
};

// Map controller component to handle automatic resizing, smooth bounds fitting, and invalidation
function MapController({ routes, selectedRouteIndex, startCoords, endCoords }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate immediately and in staggered intervals to catch layout reflows
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 700);

    const container = map.getContainer();
    let ro;
    if (window.ResizeObserver && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", onResize);
      if (ro && container) ro.unobserve(container);
    };
  }, [map, routes?.length, selectedRouteIndex]);

  useEffect(() => {
    if (routes && routes.length > 0 && routes[selectedRouteIndex]) {
      const coords = routes[selectedRouteIndex].coordinates;
      if (coords && coords.length > 0) {
        map.invalidateSize();
        map.fitBounds(coords, { padding: [50, 50], maxZoom: 14 });
      }
    } else if (startCoords && endCoords) {
      map.invalidateSize();
      map.fitBounds(
        [[startCoords.lat, startCoords.lng], [endCoords.lat, endCoords.lng]],
        { padding: [50, 50], maxZoom: 14 }
      );
    }
  }, [routes, selectedRouteIndex, startCoords, endCoords, map]);

  return null;
}

export default function RoutesPage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  
  // Search Inputs & Suggestions
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [stations, setStations] = useState([]);
  
  // Search States
  const [departureOffset, setDepartureOffset] = useState("now");
  const [travelMode, setTravelMode] = useState("driving"); // driving, cycling, walking
  const [routes, setRoutes] = useState([]);

  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hourStr, minStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${String(hour).padStart(2, '0')}:${minStr} ${ampm}`;
  };

  const getSelectedDateTimeStr = () => {
    const d = new Date();
    if (departureOffset === "+1h") {
      d.setHours(d.getHours() + 1);
    } else if (departureOffset === "+6h") {
      d.setHours(d.getHours() + 6);
    } else if (departureOffset === "+12h") {
      d.setHours(d.getHours() + 12);
    } else if (departureOffset === "+24h") {
      d.setDate(d.getDate() + 1);
    }
    
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const timeStr = formatTime12h(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    const dayLabel = d.getDate() === (new Date()).getDate() ? "Today" : "Tomorrow";
    
    return `${dateStr} (${dayLabel}), ${timeStr}`;
  };

  const getForecastWindowEndStr = () => {
    const d = new Date();
    if (departureOffset === "+1h") {
      d.setHours(d.getHours() + 1);
    } else if (departureOffset === "+6h") {
      d.setHours(d.getHours() + 6);
    } else if (departureOffset === "+12h") {
      d.setHours(d.getHours() + 12);
    } else if (departureOffset === "+24h") {
      d.setDate(d.getDate() + 1);
    }
    
    d.setDate(d.getDate() + 1);
    
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const timeStr = formatTime12h(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    
    return `${dateStr} (Tomorrow), ${timeStr}`;
  };
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  
  // Health Profile State
  const [healthProfile, setHealthProfile] = useState({
    sensitivity: "general",
    aqi_threshold: 150,
    alerts_enabled: true
  });
  const [showProfileConfig, setShowProfileConfig] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Focus tracking for suggestion boxes
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  // Debounce & abort refs for fluid typing
  const startTimerRef = useRef(null);
  const endTimerRef = useRef(null);
  const startAbortRef = useRef(null);
  const endAbortRef = useRef(null);

  // Initialize
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        
        // Fetch health profile
        fetchHealthProfile();
        // Fetch route history
        fetchRouteHistory();
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch stations list to overlay on map
    fetch("http://localhost:8000/api/dashboard/stations")
      .then(res => res.json())
      .then(data => {
        if (data.stations) {
          setStations(data.stations);
        }
      })
      .catch(err => console.error("Error loading stations for routes map:", err))
      .finally(() => setInitialLoading(false));

    return () => {
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
      if (startAbortRef.current) startAbortRef.current.abort();
      if (endAbortRef.current) endAbortRef.current.abort();
    };
  }, []);

  const fetchHealthProfile = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/routes/health-profile", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.detail) {
          setHealthProfile(data);
        }
      })
      .catch(err => console.error("Error loading health profile:", err));
  };

  const fetchRouteHistory = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://localhost:8000/api/routes/history", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(err => console.error("Error loading history:", err));
  };

  const handleUpdateHealthProfile = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setSavingProfile(true);
    fetch("http://localhost:8000/api/routes/health-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(healthProfile)
    })
      .then(res => res.json())
      .then(data => {
        setSavingProfile(false);
        setShowProfileConfig(false);
        if (data && !data.detail) {
          setHealthProfile(data);
          // If routes are already queried, re-run search to update risk warnings
          if (startCoords && endCoords) {
            handleSearch();
          }
        }
      })
      .catch(err => {
        setSavingProfile(false);
        console.error("Error updating profile:", err);
      });
  };

  // High-performance debounced suggestions fetch
  const handleQueryChange = (val, isStart) => {
    if (isStart) {
      setStartQuery(val);
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (startAbortRef.current) startAbortRef.current.abort();

      if (val.trim().length < 3) {
        setStartSuggestions([]);
        return;
      }

      startTimerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        startAbortRef.current = controller;
        try {
          const res = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&bbox=76.84,28.40,77.35,28.88`,
            { signal: controller.signal }
          );
          if (!res.ok) return;
          const data = await res.json();
          const items = (data.features || []).map((f) => ({
            name: [f.properties.name, f.properties.street, f.properties.city].filter(Boolean).join(", "),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0]
          }));
          setStartSuggestions(items);
        } catch (e) {
          if (e.name !== "AbortError") {
            console.error(e);
          }
        }
      }, 250);
    } else {
      setEndQuery(val);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
      if (endAbortRef.current) endAbortRef.current.abort();

      if (val.trim().length < 3) {
        setEndSuggestions([]);
        return;
      }

      endTimerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        endAbortRef.current = controller;
        try {
          const res = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5&bbox=76.84,28.40,77.35,28.88`,
            { signal: controller.signal }
          );
          if (!res.ok) return;
          const data = await res.json();
          const items = (data.features || []).map((f) => ({
            name: [f.properties.name, f.properties.street, f.properties.city].filter(Boolean).join(", "),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0]
          }));
          setEndSuggestions(items);
        } catch (e) {
          if (e.name !== "AbortError") {
            console.error(e);
          }
        }
      }, 250);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!startCoords || !endCoords) {
      setError("Please select both a starting point and destination from suggestions.");
      return;
    }

    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      start_name: startQuery,
      end_name: endQuery,
      start_lat: startCoords.lat,
      start_lng: startCoords.lng,
      end_lat: endCoords.lat,
      end_lng: endCoords.lng,
      departure_offset: departureOffset
    };

    fetch("http://localhost:8000/api/routes/search", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("API returned failure during route search.");
        return res.json();
      })
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          // Parse string geometries
          const parsedRoutes = data.routes.map(r => ({
            ...r,
            coordinates: JSON.parse(r.route_geometry).map(c => [c[1], c[0]]) // Flip to [lat, lng]
          }));
          setRoutes(parsedRoutes);
          setSelectedRouteIndex(0);
          fetchRouteHistory();
        } else {
          setError("No routes found between selected points.");
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to search routes.");
        setLoading(false);
      });
  };

  const applyHistoryItem = (hItem) => {
    setStartQuery(hItem.start_name);
    setEndQuery(hItem.end_name);
    setStartCoords({ lat: hItem.start_lat, lng: hItem.start_lng });
    setEndCoords({ lat: hItem.end_lat, lng: hItem.end_lng });
    setDepartureOffset(hItem.departure_offset);
    
    // Automatically trigger search
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch("http://localhost:8000/api/routes/search", {
      method: "POST",
      headers,
      body: JSON.stringify({
        start_name: hItem.start_name,
        end_name: hItem.end_name,
        start_lat: hItem.start_lat,
        start_lng: hItem.start_lng,
        end_lat: hItem.end_lat,
        end_lng: hItem.end_lng,
        departure_offset: hItem.departure_offset
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const parsedRoutes = data.routes.map(r => ({
            ...r,
            coordinates: JSON.parse(r.route_geometry).map(c => [c[1], c[0]])
          }));
          setRoutes(parsedRoutes);
          setSelectedRouteIndex(0);
        }
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch route details.");
        setLoading(false);
      });
  };
  useEffect(() => {
    if (startCoords && endCoords) {
      handleSearch();
    }
  }, [departureOffset, travelMode]);

  const currentRoute = routes[selectedRouteIndex];
  const activeBand = currentRoute ? getBand(currentRoute.exposure_aqi) : null;

  const getModeDurationMins = (baseSec) => {
    let factor = 1.0;
    if (travelMode === "cycling") factor = 3.0;
    if (travelMode === "walking") factor = 6.0;
    return Math.round((baseSec * factor) / 60.0);
  };

  const getDosageIndex = (aqi, baseSec) => {
    let durationFactor = 1.0;
    let breathingFactor = 1.0;
    if (travelMode === "cycling") {
      durationFactor = 3.0;
      breathingFactor = 2.2;
    } else if (travelMode === "walking") {
      durationFactor = 6.0;
      breathingFactor = 1.5;
    }
    const durationHrs = (baseSec * durationFactor) / 3600.0;
    return Math.round(aqi * durationHrs * breathingFactor);
  };

  // Custom sensitivity threshold presets helper
  const sensitivityPresets = {
    general: { label: language === 'en' ? "General Public" : "आम जनता", threshold: 150 },
    child: { label: language === 'en' ? "Children" : "बच्चे", threshold: 100 },
    elderly: { label: language === 'en' ? "Elderly Citizens" : "वरिष्ठ नागरिक", threshold: 100 },
    asthmatic: { label: language === 'en' ? "Asthmatic Patients" : "अस्थमा के रोगी", threshold: 80 },
    cardio: { label: language === 'en' ? "Cardio-Vascular Concerns" : "हृदय संबंधी चिंताएं", threshold: 80 }
  };

  if (initialLoading) {
    return (
      <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar activePage="Routes" />
        <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          <span>{language === 'en' ? "Loading pollution route advisor..." : "प्रदूषण मार्ग सलाहकार लोड किया जा रहा है..."}</span>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Background Ambience */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <Navbar activePage="Routes" />

      <main style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "30px 2rem 60px 2rem", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        
        {/* Header Summary */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0", fontFamily: "'Outfit', sans-serif" }}>
              {language === 'en' ? "Route advisory" : "मार्ग सलाह"}
            </h1>
            <p style={{ color: "#475569", fontSize: "14.5px", lineHeight: "1.5", margin: 0, maxWidth: "700px" }}>
              {language === 'en' 
                ? "Compare driving routes optimized for air quality. Find the cleanest path and plan departures up to 24 hours ahead using live CPCB telemetry and AI forecasts."
                : "वायु गुणवत्ता के आधार पर अनुकूलित ड्राइविंग मार्गों की तुलना करें। लाइव सीपीसीबी डेटा और एआई पूर्वानुमानों का उपयोग करके सबसे स्वच्छ मार्ग खोजें और 24 घंटे पहले तक प्रस्थान की योजना बनाएं।"
              }
            </p>
          </div>

          {/* Health Profile Control */}
          <div style={{ marginTop: "16px" }}>
            <button 
              onClick={() => setShowProfileConfig(!showProfileConfig)}
              style={{
                background: "#047857",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(4, 120, 87, 0.15)"
              }}
            >
              <Heart size={14} />
              {language === 'en' ? "Health Sensitivity Profile" : "स्वास्थ्य संवेदनशीलता प्रोफ़ाइल"}: {sensitivityPresets[healthProfile.sensitivity]?.label || "General"}
            </button>
          </div>
        </div>

        {/* Health Profile Config Dropdown Bar */}
        {showProfileConfig && (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            border: "1px solid rgba(4, 120, 87, 0.2)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 14px 0", color: "#0f172a" }}>
              {language === 'en' ? "Update Health Profile Sensitivity" : "स्वास्थ्य प्रोफ़ाइल संवेदनशीलता अपडेट करें"}
            </h3>
            <form onSubmit={handleUpdateHealthProfile} style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                  {language === 'en' ? "Sensitivity Level" : "संवेदनशीलता स्तर"}
                </label>
                <select 
                  value={healthProfile.sensitivity} 
                  onChange={(e) => {
                    const sens = e.target.value;
                    setHealthProfile(prev => ({
                      ...prev,
                      sensitivity: sens,
                      aqi_threshold: sensitivityPresets[sens].threshold
                    }));
                  }}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    background: "#ffffff"
                  }}
                >
                  <option value="general">{language === 'en' ? "General Public (Default)" : "सामान्य जनता (डिफ़ॉल्ट)"}</option>
                  <option value="child">{language === 'en' ? "Child Sensitivity" : "बच्चों की संवेदनशीलता"}</option>
                  <option value="elderly">{language === 'en' ? "Elderly Sensitivity" : "बुजुर्गों की संवेदनशीलता"}</option>
                  <option value="asthmatic">{language === 'en' ? "Asthmatic Patients" : "अस्थमा के रोगी"}</option>
                  <option value="cardio">{language === 'en' ? "Cardio-Vascular / Heart Patients" : "हृदय / दिल के रोगी"}</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                  {language === 'en' ? "Alert Threshold (AQI)" : "अलर्ट थ्रेसहोल्ड (AQI)"}
                </label>
                <input 
                  type="number" 
                  value={healthProfile.aqi_threshold}
                  onChange={(e) => setHealthProfile(prev => ({ ...prev, aqi_threshold: parseInt(e.target.value) || 150 }))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    color: "#0f172a",
                    width: "80px"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "38px" }}>
                <input 
                  type="checkbox" 
                  id="alerts_enabled"
                  checked={healthProfile.alerts_enabled}
                  onChange={(e) => setHealthProfile(prev => ({ ...prev, alerts_enabled: e.target.checked }))}
                />
                <label htmlFor="alerts_enabled" style={{ fontSize: "13px", color: "#475569", fontWeight: "600", cursor: "pointer" }}>
                  {language === 'en' ? "Receive browser notifications" : "ब्राउज़र सूचनाएं प्राप्त करें"}
                </label>
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowProfileConfig(false)}
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 16px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {language === 'en' ? "Cancel" : "रद्द करें"}
                </button>
                <button 
                  type="submit" 
                  disabled={savingProfile}
                  style={{
                    background: "#047857",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  {savingProfile 
                    ? (language === 'en' ? "Saving..." : "सहेजा जा रहा है...") 
                    : (language === 'en' ? "Save Settings" : "सेटिंग्स सहेजें")
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Grid: Sidebar Inputs & OSRM Comparison + Map View */}
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "28px", marginBottom: "36px" }}>
          
          {/* Left Panel: Search & Comparisons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Search Input Card */}
            <div className="contrast-card" style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "24px",
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 16px 0", color: "#0f172a" }}>
                {language === 'en' ? "Plan your route" : "अपना मार्ग नियोजित करें"}
              </h3>

              <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Source Input */}
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "capitalize", marginBottom: "6px" }}>
                    {language === 'en' ? "Starting Address" : "प्रारंभिक पता"}
                  </label>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 12px", background: "var(--input-bg)" }}>
                    <MapPin size={16} color="#0284c7" style={{ marginRight: "8px" }} />
                    <input 
                      type="text" 
                      placeholder={language === 'en' ? "e.g. Connaught Place, home area, metro..." : "जैसे कि कनॉट प्लेस"}
                      value={startQuery}
                      onChange={(e) => handleQueryChange(e.target.value, true)}
                      onFocus={() => setShowStartSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                      style={{ border: "none", outline: "none", fontSize: "13px", width: "100%", color: "#0f172a", background: "transparent" }}
                    />
                  </div>
                  {showStartSuggestions && startSuggestions.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "60px",
                      left: 0,
                      width: "100%",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      zIndex: 1000,
                      maxHeight: "180px",
                      overflowY: "auto"
                    }}>
                      {startSuggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setStartQuery(item.name);
                            setStartCoords({ lat: item.lat, lng: item.lng });
                            setStartSuggestions([]);
                          }}
                          style={{
                            padding: "10px 14px",
                            fontSize: "12px",
                            color: "#475569",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f5f9"
                          }}
                          onMouseDown={(e) => e.preventDefault()} // Prevents blur before click
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Destination Input */}
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "capitalize", marginBottom: "6px" }}>
                    {language === 'en' ? "Destination Address" : "गंतव्य पता"}
                  </label>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 12px", background: "var(--input-bg)" }}>
                    <MapPin size={16} color="#8b5cf6" style={{ marginRight: "8px" }} />
                    <input 
                      type="text" 
                      placeholder={language === 'en' ? "e.g. Dwarka, office, IIT Delhi..." : "जैसे कि द्वारका"}
                      value={endQuery}
                      onChange={(e) => handleQueryChange(e.target.value, false)}
                      onFocus={() => setShowEndSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowEndSuggestions(false), 200)}
                      style={{ border: "none", outline: "none", fontSize: "13px", width: "100%", color: "#0f172a", background: "transparent" }}
                    />
                  </div>
                  {showEndSuggestions && endSuggestions.length > 0 && (
                    <div style={{
                      position: "absolute",
                      top: "60px",
                      left: 0,
                      width: "100%",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      zIndex: 1000,
                      maxHeight: "180px",
                      overflowY: "auto"
                    }}>
                      {endSuggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setEndQuery(item.name);
                            setEndCoords({ lat: item.lat, lng: item.lng });
                            setEndSuggestions([]);
                          }}
                          style={{
                            padding: "10px 14px",
                            fontSize: "12px",
                            color: "#475569",
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f5f9"
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Travel Mode (Multi-Modal Segment Control) */}
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "capitalize", marginBottom: "8px" }}>
                    {language === 'en' ? "Travel Mode" : "यात्रा का माध्यम"}
                  </label>
                  <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "10px", padding: "4px", gap: "4px" }}>
                    {[
                      { id: "driving", label: language === 'en' ? "Driving" : "कार", icon: Car },
                      { id: "cycling", label: language === 'en' ? "Cycling" : "साइकिल", icon: Bike },
                      { id: "walking", label: language === 'en' ? "Walking" : "पैदल", icon: Footprints }
                    ].map((mode) => {
                      const isSelected = travelMode === mode.id;
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setTravelMode(mode.id)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: isSelected ? "800" : "600",
                            color: isSelected ? "#0284c7" : "#64748b",
                            background: isSelected ? "#ffffff" : "transparent",
                            boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          <Icon size={13} />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Departure Time Simulation Slider */}
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", textTransform: "capitalize", marginBottom: "8px" }}>
                    {language === 'en' ? "Departure schedule" : "प्रस्थान अनुसूची"}
                  </label>
                  
                  <div style={{ padding: "0 10px" }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="4" 
                      step="1"
                      value={["now", "+1h", "+6h", "+12h", "+24h"].indexOf(departureOffset) !== -1 ? ["now", "+1h", "+6h", "+12h", "+24h"].indexOf(departureOffset) : 0}
                      onChange={(e) => {
                        const offsets = ["now", "+1h", "+6h", "+12h", "+24h"];
                        const idx = parseInt(e.target.value, 10);
                        setDepartureOffset(offsets[idx]);
                      }}
                      style={{
                        width: "100%",
                        height: "6px",
                        borderRadius: "5px",
                        background: "#cbd5e1",
                        outline: "none",
                        cursor: "pointer",
                        margin: "12px 0 6px 0"
                      }}
                    />
                    
                    {/* Tick Labels */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>
                      <span>{language === 'en' ? "Now" : "अभी"}</span>
                      <span>+1h</span>
                      <span>+6h</span>
                      <span>+12h</span>
                      <span>+24h</span>
                    </div>
                  </div>

                  {/* Selected dynamic info box */}
                  <div style={{ fontSize: "11.5px", color: "#64748b", lineHeight: "1.4", margin: "16px 0 12px 0", background: "var(--bg-soft)", padding: "10px 12px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                    <div>
                      <strong>Selected:</strong> {getSelectedDateTimeStr()}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <strong>Forecast window:</strong> now → next 24 hours (until {getForecastWindowEndStr()})
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "4px"
                  }}
                >
                  <Search size={14} />
                  {loading 
                    ? (language === 'en' ? "Comparing paths..." : "तुलना की जा रही है...") 
                    : (language === 'en' ? "Compare pollution on routes" : "मार्गों पर प्रदूषण की तुलना करें")
                  }
                </button>

              </form>

              {error && (
                <div style={{ color: "#b91c1c", fontSize: "12.5px", marginTop: "12px", padding: "8px 12px", background: "#fee2e2", borderRadius: "8px", fontWeight: "600" }}>
                  {error}
                </div>
              )}
            </div>

            {/* Scored Routes Comparison List */}
            {loading ? (
              <div className="contrast-card" style={{
                background: "#ffffff",
                borderRadius: "24px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 4px 0", color: "#0f172a" }}>
                  {language === 'en' ? "Finding alternative routes..." : "वैकल्पिक मार्ग खोजे जा रहे हैं..."}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px" }}>
                  {language === 'en' ? "Calculating exposure indexes via LSTM..." : "एलएसटीएम के माध्यम से जोखिम सूचकांकों की गणना की जा रही है..."}
                </span>

                {[1, 2].map((i) => (
                  <div key={i} style={{ padding: "16px", borderRadius: "16px", border: "1px solid #f1f5f9", background: "#ffffff", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div className="skeleton" style={{ width: "90px", height: "16px", borderRadius: "4px" }}></div>
                      <div className="skeleton" style={{ width: "70px", height: "16px", borderRadius: "4px" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <div>
                        <div className="skeleton" style={{ width: "60px", height: "18px", borderRadius: "4px", marginBottom: "4px" }}></div>
                        <div className="skeleton" style={{ width: "110px", height: "12px", borderRadius: "3px" }}></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <div className="skeleton" style={{ width: "35px", height: "24px", borderRadius: "4px" }}></div>
                        <div className="skeleton" style={{ width: "55px", height: "12px", borderRadius: "3px", marginTop: "4px" }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : routes.length > 0 && (
              <div className="contrast-card" style={{
                background: "#ffffff",
                borderRadius: "24px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 4px 0", color: "#0f172a" }}>
                  {language === 'en' ? "Alternative Paths Found" : "वैकल्पिक मार्ग मिले"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "8px" }}>
                  {language === 'en' ? "Ranked by average AQI exposure. Click to highlight on map." : "औसत AQI जोखिम द्वारा रैंक किया गया। मानचित्र पर हाइलाइट करने के लिए क्लिक करें।"}
                </span>

                {routes.map((rt, idx) => {
                  const isSelected = selectedRouteIndex === idx;
                  const band = getBand(rt.exposure_aqi);
                  const isExceeded = rt.does_exceed_threshold;

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedRouteIndex(idx)}
                      className={isSelected ? "contrast-card selected" : "contrast-card"}
                      style={{
                        padding: "16px",
                        borderRadius: "16px",
                        border: isSelected ? "2px solid #0284c7" : "1px solid #e2e8f0",
                        background: isSelected ? "#f0f9ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {/* Badge Row */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                        {rt.is_eco_path && (
                          <span style={{ fontSize: "9px", fontWeight: "900", background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <Award size={10} /> {language === 'en' ? "ECO-PATH (LEAST POLLUTED)" : "इको-मार्ग (न्यूनतम प्रदूषित)"}
                          </span>
                        )}
                        {rt.is_fastest_path && (
                          <span style={{ fontSize: "9px", fontWeight: "900", background: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: "6px" }}>
                            {language === 'en' ? "FASTEST PATH" : "सबसे तेज़ मार्ग"}
                          </span>
                        )}
                        {isExceeded && (
                          <span style={{ fontSize: "9px", fontWeight: "900", background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <AlertTriangle size={10} /> {language === 'en' ? "SENSITIVITY WARNING" : "संवेदनशीलता चेतावनी"}
                          </span>
                        )}
                      </div>

                      {/* Route Details */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "14px", color: "#0f172a" }}>{language === 'en' ? `Route ${idx + 1}` : `मार्ग ${idx + 1}`}</strong>
                          <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                            {(rt.distance_m / 1000.0).toFixed(1)} km • {getModeDurationMins(rt.duration_s)} mins
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "#0284c7", fontWeight: "800", marginTop: "4px" }}>
                            {language === 'en' ? "Inhaled Dosage Index:" : "श्वसन अवशेष सूचकांक:"} {getDosageIndex(rt.exposure_aqi, rt.duration_s)} {language === 'en' ? "units" : "इकाई"}
                          </span>
                        </div>

                        {/* AQI Exposure Badge */}
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", display: "block" }}>
                            {Math.round(rt.exposure_aqi)}
                          </span>
                          <span style={{ fontSize: "9.5px", fontWeight: "700", color: band.color, background: band.bg, padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "2px" }}>
                            {language === 'en' ? "Avg AQI" : "औसत AQI"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Personalized Health Advisories Box */}
                {currentRoute && activeBand && (
                  <div style={{
                    marginTop: "16px",
                    padding: "16px",
                    borderRadius: "16px",
                    background: activeBand.bg,
                    color: activeBand.color,
                    border: `1px solid ${activeBand.color}33`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Heart size={16} />
                      <strong style={{ fontSize: "12.5px" }}>
                        {language === 'en' ? "Personalized Health Advisory" : "व्यक्तिगत स्वास्थ्य सलाह"}
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", lineHeight: "1.45" }}>
                      {(() => {
                        const aqi = currentRoute.exposure_aqi;
                        const sens = healthProfile.sensitivity;
                        if (sens === "asthmatic" || sens === "cardio") {
                          if (aqi > 80) {
                            return language === 'en'
                              ? "Advisory: Elevated exposure. Asthma/Cardio profile detected. Commuting via driving/closed vehicle is recommended over walking or cycling."
                              : "सलाह: बढ़ा हुआ जोखिम। अस्थमा/हृदय संबंधी चिंता प्रोफाइल। पैदल चलने या साइकिल चलाने के बजाय कार/बंद वाहन से यात्रा करने की सलाह दी जाती है।";
                          }
                        }
                        if (sens === "elderly" || sens === "child") {
                          if (aqi > 100) {
                            return language === 'en'
                              ? "Advisory: Sensitive age group tier. Wear an N95 mask if outdoors, or prefer air-conditioned transit lines."
                              : "सलाह: संवेदनशील आयु वर्ग। बाहर होने पर N95 मास्क पहनें, या वातानुकूलित पारगमन लाइनों को प्राथमिकता दें।";
                          }
                        }
                        if (aqi > 200) {
                          return language === 'en'
                            ? "Warning: Severe pollution corridor. Limit active outdoor exposure and utilize protective respirators."
                            : "चेतावनी: गंभीर प्रदूषण गलियारा। सक्रिय बाहरी जोखिम को सीमित करें और सुरक्षात्मक मास्क का उपयोग करें।";
                        }
                        if (aqi > 100) {
                          return language === 'en'
                            ? "Info: Moderate pollutant concentration. Active groups should monitor breathing parameters."
                            : "सूचना: मध्यम प्रदूषक एकाग्रता। सक्रिय समूहों को श्वास मापदंडों की निगरानी करनी चाहिए।";
                        }
                        return language === 'en'
                          ? "Clean air corridor: Exposure index is low. Safe for walking and outdoor recreation."
                          : "स्वच्छ वायु गलियारा: जोखिम सूचकांक कम है। टहलने और बाहरी मनोरंजन के लिए सुरक्षित।";
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Map View */}
          <div className="contrast-card" style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            minHeight: "680px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box"
          }}>
            {/* Header info bar */}
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 4px 0", color: "#0f172a" }}>
                  {language === 'en' ? "Interactive pollution routing map" : "इंटरएक्टिव प्रदूषण मार्ग मानचित्र"}
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {routes.length > 0 
                    ? (language === 'en' ? `Showing route paths. Chosen: Route ${selectedRouteIndex + 1}` : `मार्ग पथ दिखाए जा रहे हैं। चयनित: मार्ग ${selectedRouteIndex + 1}`) 
                    : (language === 'en' ? "Enter starting point and destination in the left panel to display routes." : "मार्गों को प्रदर्शित करने के लिए बाएं पैनल में शुरुआती बिंदु और गंतव्य दर्ज करें।")}
                </span>
              </div>

              {currentRoute && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>{language === 'en' ? "Route Avg Exposure:" : "मार्ग औसत जोखिम:"}</span>
                  <strong style={{ 
                    fontSize: "14px", 
                    padding: "6px 12px", 
                    borderRadius: "8px", 
                    background: activeBand.bg, 
                    color: activeBand.color,
                    fontWeight: "800"
                  }}>
                    AQI {Math.round(currentRoute.exposure_aqi)} ({getTranslatedLabel(activeBand.label, language)})
                  </strong>
                </div>
              )}
            </div>
            {/* Warning banner for sensitivity profile */}
            {currentRoute?.does_exceed_threshold && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#991b1b"
              }}>
                <ShieldAlert size={18} />
                <span style={{ fontSize: "12.5px", fontWeight: "700" }}>
                  {language === 'en' 
                    ? `HEALTH WARNING: This path contains sections exceeding your profile threshold of AQI ${healthProfile.aqi_threshold} (${sensitivityPresets[healthProfile.sensitivity]?.label || "General"}).` 
                    : `स्वास्थ्य चेतावनी: इस मार्ग में ऐसे खंड हैं जो आपके स्वास्थ्य प्रोफ़ाइल थ्रेसहोल्ड AQI ${healthProfile.aqi_threshold} (${sensitivityPresets[healthProfile.sensitivity]?.label || "General"}) से अधिक हैं।`
                  }
                </span>
              </div>
            )}

            {/* Map Container */}
            <div style={{ flexGrow: 1, minHeight: "550px", height: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
              <MapContainer 
                center={[28.6300, 77.1900]} 
                zoom={11} 
                scrollWheelZoom={true} 
                style={{ width: "100%", height: "100%", minHeight: "550px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  keepBuffer={10}
                  updateWhenIdle={false}
                  updateWhenZooming={false}
                />

                {/* Draw CPCB Station Markers */}
                {routes.length === 0 && stations.map((st) => (
                  <CircleMarker
                    key={st.id}
                    center={[st.lat, st.lng]}
                    radius={5.5}
                    pathOptions={{
                      fillColor: getMarkerColor(st.aqi),
                      fillOpacity: 0.65,
                      color: "#ffffff",
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div style={{ fontSize: "11px", padding: "1px" }}>
                        <strong>{st.shortName}</strong>
                        <span style={{ display: "block", color: "#475569" }}>AQI: {st.aqi}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Draw Route Polylines */}
                {routes.map((rt, idx) => {
                  const isSelected = selectedRouteIndex === idx;
                  const color = rt.is_eco_path ? "#10b981" : "#4f46e5"; // Green for eco, Purple/Indigo for others
                  
                  return (
                    <Polyline
                      key={idx}
                      positions={rt.coordinates}
                      pathOptions={{
                        color: color,
                        weight: isSelected ? 6 : 3,
                        opacity: isSelected ? 0.9 : 0.45,
                        dashArray: isSelected ? null : "8, 6"
                      }}
                      eventHandlers={{
                        click: () => setSelectedRouteIndex(idx)
                      }}
                    >
                      <Popup>
                        <div style={{ fontSize: "12px", padding: "2px" }}>
                          <strong>{language === 'en' ? `Route ${idx + 1}` : `मार्ग ${idx + 1}`} {rt.is_eco_path ? (language === 'en' ? "(Eco-Path)" : "(इको-मार्ग)") : ""}</strong>
                          <span style={{ display: "block", color: "#475569", marginTop: "3px" }}>
                            {language === 'en' ? "AQI Exposure" : "AQI जोखिम"}: {Math.round(rt.exposure_aqi)}
                          </span>
                        </div>
                      </Popup>
                    </Polyline>
                  );
                })}

                {/* Start Marker */}
                {startCoords && (
                  <CircleMarker 
                    center={[startCoords.lat, startCoords.lng]} 
                    radius={9}
                    pathOptions={{ fillColor: "#0284c7", fillOpacity: 0.9, color: "#ffffff", weight: 2 }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -8]} className="start-map-tooltip">
                      {language === 'en' ? "START" : "प्रारंभ"}
                    </Tooltip>
                    <Popup>
                      <div style={{ fontSize: "12px" }}>
                        <strong>{language === 'en' ? "Starting Point:" : "शुरुआती बिंदु:"}</strong>
                        <span style={{ display: "block", color: "#64748b" }}>{startQuery}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}

                {/* Destination Marker */}
                {endCoords && (
                  <CircleMarker 
                    center={[endCoords.lat, endCoords.lng]} 
                    radius={9}
                    pathOptions={{ fillColor: "#c084fc", fillOpacity: 0.9, color: "#ffffff", weight: 2 }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -8]} className="end-map-tooltip">
                      {language === 'en' ? "END" : "अंत"}
                    </Tooltip>
                    <Popup>
                      <div style={{ fontSize: "12px" }}>
                        <strong>{language === 'en' ? "Destination:" : "गंतव्य:"}</strong>
                        <span style={{ display: "block", color: "#64748b" }}>{endQuery}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}

                {/* Auto center map and resize */}
                <MapController 
                  routes={routes} 
                  selectedRouteIndex={selectedRouteIndex} 
                  startCoords={startCoords} 
                  endCoords={endCoords} 
                />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section: Search History */}
        {history.length > 0 && (
          <div className="contrast-card" style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
              {language === 'en' ? "Your Route Search History" : "आपका मार्ग खोज इतिहास"}
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {history.map((item) => {
                const band = getBand(item.exposure_aqi);
                return (
                  <div 
                    key={item.id}
                    onClick={() => applyHistoryItem(item)}
                    className="contrast-card history-item-card"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "border-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ maxWidth: "70%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {(item.start_name || "").split(",")[0]}
                        </span>
                        <ChevronRight size={12} color="#64748b" />
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {(item.end_name || "").split(",")[0]}
                        </span>
                      </div>
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        {language === 'en' ? "Departure Schedule" : "प्रस्थान अनुसूची"}: {item.departure_offset === "now" ? (language === 'en' ? "Immediate" : "तुरंत") : item.departure_offset}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", display: "block" }}>
                        AQI {Math.round(item.exposure_aqi)}
                      </span>
                      <span style={{ fontSize: "9px", fontWeight: "800", color: band.color, background: band.bg, padding: "2px 5px", borderRadius: "4px", display: "inline-block", marginTop: "2px" }}>
                        {getTranslatedLabel(band.label, language)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="home-footer" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "24px 4%",
        boxSizing: "border-box",
        borderTop: "1px solid #e2e8f0",
        background: "#ffffff",
        fontSize: "13px",
        width: "100%",
        marginTop: "auto"
      }}>
        <div style={{ color: "#475569", fontSize: "13px", fontWeight: "800" }}>
          {t('homeFootSubtitle')}
        </div>
        <div style={{ display: "flex", gap: "16px", color: "#0284c7", fontSize: "11px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", alignItems: "center" }}>
          <span>OSRM MAPPING • INVERSE DISTANCE WEIGHTING • PERSONALIZED THRESHOLDS</span>
        </div>
      </footer>
    </div>
  );
}
