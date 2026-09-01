import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AqiMap from "../components/AqiMap";
import ForecastChart from "../components/ForecastChart";
import StationCard from "../components/StationCard";
import { useLanguage } from "../context/LanguageContext";
import { Wind } from "lucide-react";

const getBand = (aqi) => {
  if (aqi <= 100) return { label: "Satisfactory", bg: "#dcfce7", color: "#15803d" };
  if (aqi <= 200) return { label: "Moderate", bg: "#ffedd5", color: "#c2410c" };
  if (aqi <= 300) return { label: "Poor", bg: "#fee2e2", color: "#991b1b" };
  return { label: "Severe", bg: "#fca5a5", color: "#7f1d1d" };
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

const estimatePm25FromAqi = (aqi) => {
  if (aqi <= 50) return (aqi * 30.0) / 50.0;
  if (aqi <= 100) return 30.0 + ((aqi - 50.0) * 30.0) / 50.0;
  if (aqi <= 200) return 60.0 + ((aqi - 100.0) * 30.0) / 100.0;
  if (aqi <= 300) return 90.0 + ((aqi - 200.0) * 30.0) / 100.0;
  if (aqi <= 400) return 120.0 + ((aqi - 300.0) * 130.0) / 100.0;
  return 250.0 + ((aqi - 400.0) * 250.0) / 100.0;
};

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [weather, setWeather] = useState({ temperature: 30.5, humidity: 65, wind_speed: 1.2 });
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);

  const formatObservationTime = (dateStr) => {
    const defaultDate = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatDateObj = (d) => {
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    };

    if (!dateStr) return formatDateObj(defaultDate);
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return formatDateObj(defaultDate);
      return formatDateObj(d);
    } catch (e) {
      return formatDateObj(defaultDate);
    }
  };

  // 1. Initial Load: Get all stations
  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stations")
      .then((res) => res.json())
      .then((data) => {
        if (data.stations && data.stations.length > 0) {
          setStations(data.stations);
          setSelectedStation(data.stations[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading stations:", err);
        setLoading(false);
      });
  }, []);

  // 2. When selected station changes, fetch live forecast & weather
  useEffect(() => {
    if (!selectedStation) return;
    setForecastLoading(true);

    fetch(`http://localhost:8000/api/dashboard/forecast?station=${encodeURIComponent(selectedStation.name)}`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.weather);
        setForecast(data.forecast);
        
        // Find the +1h forecast value to keep card & summary values aligned
        const forecast1h = data.forecast?.find(f => f.horizon === "+1h");
        if (forecast1h) {
          setSelectedStation(prev => {
            if (!prev) return null;
            if (prev.aqi === forecast1h.aqi) return prev;
            return {
              ...prev,
              aqi: forecast1h.aqi,
              pm25: Number(estimatePm25FromAqi(forecast1h.aqi).toFixed(1))
            };
          });
          
          setStations(prevList => {
            return prevList.map(s => {
              if (s.name === selectedStation.name) {
                if (s.aqi === forecast1h.aqi) return s;
                return {
                  ...s,
                  aqi: forecast1h.aqi,
                  pm25: Number(estimatePm25FromAqi(forecast1h.aqi).toFixed(1))
                };
              }
              return s;
            });
          });
        }
        
        setForecastLoading(false);
      })
      .catch((err) => {
        console.error("Error loading forecast:", err);
        setForecastLoading(false);
      });
  }, [selectedStation?.name]);

  if (!selectedStation) return null;
  const currentBand = getBand(selectedStation.aqi);

  if (loading && stations.length === 0) {
    return (
      <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar activePage="Dashboard" />
        
        <main style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "30px 2rem 60px 2rem", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
          {/* Header Summary Static Parts */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
              {t('dashTitle')}
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
              {language === 'en' 
                ? "Click any Delhi monitoring station on the map or in the list below to update live station readings, current weather, and the 24h deep learning forecast." 
                : "लाइव स्टेशन रीडिंग, वर्तमान मौसम और 24 घंटे के डीप लर्निंग पूर्वानुमान को अपडेट करने के लिए मैप या नीचे दी गई सूची में किसी भी दिल्ली निगरानी स्टेशन पर क्लिक करें।"
              }
            </p>

            {/* Skeleton Observational Time */}
            <div className="skeleton" style={{ width: "240px", height: "16px", borderRadius: "4px", marginBottom: "14px" }}></div>

            {/* Skeleton Quick Metrics Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "32px", marginTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div className="skeleton" style={{ width: "80px", height: "70px", borderRadius: "12px" }}></div>
                <div>
                  <div className="skeleton" style={{ width: "120px", height: "14px", borderRadius: "4px", marginBottom: "6px" }}></div>
                  <div className="skeleton" style={{ width: "80px", height: "24px", borderRadius: "6px" }}></div>
                </div>
              </div>
              <div className="skeleton" style={{ width: "140px", height: "50px", borderRadius: "10px" }}></div>
              <div className="skeleton" style={{ width: "140px", height: "50px", borderRadius: "10px" }}></div>
            </div>
          </div>

          {/* Grid Layout Skeletons */}
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "28px", marginBottom: "36px" }}>
            {/* Left Card: Map Skeleton */}
            <div className="contrast-card" style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", height: "550px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="skeleton" style={{ width: "180px", height: "24px", borderRadius: "6px" }}></div>
              <div className="skeleton" style={{ width: "260px", height: "14px", borderRadius: "4px" }}></div>
              <div className="skeleton" style={{ flexGrow: 1, borderRadius: "16px" }}></div>
            </div>

            {/* Right Card: Forecast Column Skeleton */}
            <div className="contrast-card" style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", height: "550px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="skeleton" style={{ width: "240px", height: "24px", borderRadius: "6px" }}></div>
              <div className="skeleton" style={{ width: "180px", height: "14px", borderRadius: "4px" }}></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                <div className="skeleton" style={{ height: "80px", borderRadius: "12px" }}></div>
                <div className="skeleton" style={{ height: "80px", borderRadius: "12px" }}></div>
                <div className="skeleton" style={{ height: "80px", borderRadius: "12px" }}></div>
                <div className="skeleton" style={{ height: "80px", borderRadius: "12px" }}></div>
              </div>
              <div className="skeleton" style={{ flexGrow: 1, borderRadius: "12px", marginTop: "12px" }}></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Background Ambience */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>


      <Navbar activePage="Dashboard" />

      <main style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "30px 2rem 60px 2rem", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        
        {/* Header Summary */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
            {t('dashTitle')}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
            {language === 'en' 
              ? "Click any Delhi monitoring station on the map or in the list below to update live station readings, current weather, and the 24h deep learning forecast." 
              : "लाइव स्टेशन रीडिंग, वर्तमान मौसम और 24 घंटे के डीप लर्निंग पूर्वानुमान को अपडेट करने के लिए मैप या नीचे दी गई सूची में किसी भी दिल्ली निगरानी स्टेशन पर क्लिक करें।"
            }
          </p>

          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
            {language === 'en' ? "Station" : "स्टेशन"}: <strong style={{ color: "#0f172a" }}>{selectedStation.shortName}</strong> | {language === 'en' ? "last response" : "अंतिम उत्तर"} {formatObservationTime(selectedStation?.observed_at)}
          </div>

          {/* Quick Metrics Bar: Emphasize Current AQI */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "32px", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "4.5rem", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>{selectedStation.aqi}</span>
              <div>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#64748b", display: "block" }}>
                  {language === 'en' ? `AQI at ${selectedStation.shortName}` : `${selectedStation.shortName} पर AQI`}
                </span>
                <span style={{ 
                  display: "inline-block", 
                  marginTop: "6px", 
                  padding: "6px 14px", 
                  borderRadius: "100px", 
                  background: currentBand.bg, 
                  color: currentBand.color, 
                  fontWeight: "800", 
                  fontSize: "13px" 
                }}>
                  {getTranslatedLabel(currentBand.label, language)}
                </span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: "1px", height: "60px", background: "#cbd5e1" }}></div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "28px" }}>
              <div>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#475569", lineHeight: 1 }}>{selectedStation.pm25}</span>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>PM2.5 (µg/m³)</div>
              </div>
              <div>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#475569", lineHeight: 1 }}>{weather.temperature}°C</span>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  {language === 'en' ? (
                    `Open-Meteo now • RH ${weather.humidity}% • wind ${weather.wind_speed} m/s`
                  ) : (
                    `ओपन-मीटियो लाइव • आर्द्रता ${weather.humidity}% • हवा ${weather.wind_speed} मी/से`
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Grid: Map & LSTM Forecast */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "28px", marginBottom: "36px" }}>
          
          {/* Leaflet Map Card Container */}
          <div className="contrast-card" style={{ 
            background: "#ffffff", 
            borderRadius: "24px", 
            padding: "24px", 
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
            border: "1px solid rgba(15, 23, 42, 0.05)",
            display: "flex", 
            flexDirection: "column",
            height: "530px" 
          }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 4px 0", color: "#0f172a" }}>
                  {language === 'en' ? "Delhi pollution map" : "दिल्ली प्रदूषण मानचित्र"}
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {stations.filter(s => s.openaq_id).length} {language === 'en' ? "live OpenAQ stations • click a marker to select" : "लाइव ओपनएक्यू स्टेशन • चयन करने के लिए मार्कर पर क्लिक करें"}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11px", fontWeight: "700" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>{getTranslatedLabel("Satisfactory", language)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316" }}></span>{getTranslatedLabel("Moderate", language)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span>{getTranslatedLabel("Poor", language)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7f1d1d" }}></span>{getTranslatedLabel("Severe", language)}</span>
              </div>
            </div>
            <div style={{ flexGrow: 1, borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
              <AqiMap stations={stations} selectedStation={selectedStation} onSelectStation={setSelectedStation} />
            </div>
          </div>

          {/* LSTM Forecast Card Container */}
          <div className="contrast-card" style={{ 
            background: "#ffffff", 
            borderRadius: "24px", 
            padding: "24px", 
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
            border: "1px solid rgba(15, 23, 42, 0.05)",
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between",
            height: "530px" 
          }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 8px 0", color: "#0f172a" }}>
                {language === 'en' ? "LSTM forecast (+1h / +6h / +12h / +24h)" : "एलएसटीएम पूर्वानुमान (+1h / +6h / +12h / +24h)"}
              </h3>
              <span style={{ fontSize: "13px", color: "#64748b", display: "block", marginBottom: "16px" }}>
                {language === 'en' ? "Forecast for" : "पूर्वानुमान के लिए"}: <strong style={{ color: "#0f172a" }}>{selectedStation.name}</strong> {language === 'en' ? "• last 24h from OpenAQ" : "• ओपनएक्यू से पिछले 24 घंटे"}
              </span>

              {/* 3-Column Grid for Forecast Steps */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "28px", opacity: forecastLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                {forecast.map((step, idx) => {
                  const band = getBand(step.aqi);
                  return (
                    <div key={idx} style={{ textAlign: "left", marginBottom: "8px" }}>
                      <span style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", display: "block", lineHeight: "1.1" }}>{step.aqi}</span>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block", margin: "2px 0 6px 0" }}>{step.horizon} • {step.time}</span>
                      <span style={{ 
                        fontSize: "10px", 
                        fontWeight: "800", 
                        padding: "5px 12px", 
                        borderRadius: "100px", 
                        background: band.bg, 
                        color: band.color,
                        display: "inline-block" 
                      }}>
                        {getTranslatedLabel(band.label, language)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend Chart */}
            <div style={{ flexGrow: 1, display: "flex", alignItems: "flex-end", marginTop: "16px", opacity: forecastLoading ? 0.6 : 1, transition: "opacity 0.2s" }}>
              <ForecastChart forecastData={forecast} />
            </div>
          </div>
        </div>

        {/* Monitoring Stations List */}
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
            {language === 'en' ? "Monitoring Stations" : "निगरानी केंद्र"} ({stations.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {stations.map((st) => (
              <StationCard
                key={st.id}
                station={st}
                isSelected={selectedStation.id === st.id}
                onClick={() => setSelectedStation(st)}
              />
            ))}
          </div>
        </div>

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
          <span>OPENAQ • OPEN-METEO • LSTM INTELLIGENCE</span>
        </div>
      </footer>
    </div>
  );
}