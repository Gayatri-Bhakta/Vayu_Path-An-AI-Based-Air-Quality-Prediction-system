import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AqiMap from "../components/AqiMap";
import ForecastChart from "../components/ForecastChart";
import StationCard from "../components/StationCard";

const getBand = (aqi) => {
  if (aqi <= 50) return { label: "Good", bg: "#dcfce7", color: "#166534" };
  if (aqi <= 100) return { label: "Satisfactory", bg: "#e0f2fe", color: "#0369a1" };
  if (aqi <= 200) return { label: "Moderate", bg: "#fef3c7", color: "#b45309" };
  if (aqi <= 300) return { label: "Poor", bg: "#ffedd5", color: "#c2410c" };
  if (aqi <= 400) return { label: "Very Poor", bg: "#f3e8ff", color: "#6b21a8" };
  return { label: "Severe", bg: "#fee2e2", color: "#991b1b" };
};

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [weather, setWeather] = useState({ temperature: 30.5, humidity: 65, wind_speed: 1.2 });
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load: Get all stations
  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stations")
      .then((res) => res.json())
      .then((data) => {
        setStations(data.stations);
        if (data.stations.length > 0) {
          setSelectedStation(data.stations[0]);
        }
      })
      .catch((err) => console.error("Error loading stations:", err));
  }, []);

  // 2. When selected station changes, fetch live forecast & weather
  useEffect(() => {
    if (!selectedStation) return;
    setLoading(true);

    fetch(`http://localhost:8000/api/dashboard/forecast?station=${encodeURIComponent(selectedStation.name)}`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.weather);
        setForecast(data.forecast);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading forecast:", err);
        setLoading(false);
      });
  }, [selectedStation]);

  if (!selectedStation) return null;
  const currentBand = getBand(selectedStation.aqi);

  return (
    <div className="home-page">
      {/* Background Ambience */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>

      <Navbar activePage="Dashboard" />

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "30px 2rem 60px 2rem", position: "relative", zIndex: 10 }}>
        
        {/* Header Summary */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "#0284c7", textTransform: "uppercase", marginBottom: "6px" }}>
            OPENAQ • OPEN-METEO • LSTM INTELLIGENCE
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" }}>
            Live air dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
            Click any Delhi monitoring station on the map or in the list below to update live station readings, current weather, and the 24h deep learning forecast.
          </p>

          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
            Viewing: <strong style={{ color: "#0f172a" }}>{selectedStation.name}</strong>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "28px" }}>
            <div>
              <span style={{ fontSize: "2.4rem", fontWeight: "800", color: "#0f172a", lineHeight: 1 }}>{selectedStation.aqi}</span>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>AQI at {selectedStation.shortName}</div>
            </div>
            <div>
              <span style={{ fontSize: "2.4rem", fontWeight: "800", color: "#334155", lineHeight: 1 }}>{selectedStation.pm25}</span>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>PM2.5 (µg/m³)</div>
            </div>
            <div style={{ padding: "6px 14px", borderRadius: "100px", background: currentBand.bg, color: currentBand.color, fontWeight: "800", fontSize: "13px" }}>
              {currentBand.label}
            </div>
            <div style={{ borderLeft: "1px solid #cbd5e1", paddingLeft: "24px" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" }}>{weather.temperature}°C</span>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Open-Meteo • RH {weather.humidity}% • Wind {weather.wind_speed} m/s
              </div>
            </div>
          </div>
        </div>

        {/* Center Grid: Map & LSTM Forecast */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px", marginBottom: "36px" }}>
          
          {/* Leaflet Map Card */}
          <div className="dash-card" style={{ height: "420px", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Delhi Pollution Map</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{stations.length} live CAAQMS stations • click marker to select</span>
            </div>
            <div style={{ flexGrow: 1 }}>
              <AqiMap stations={stations} selectedStation={selectedStation} onSelectStation={setSelectedStation} />
            </div>
          </div>

          {/* LSTM Forecast Card */}
          <div className="dash-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#0f172a" }}>
                  LSTM Forecast (+1h / +6h / +12h / +24h)
                </h3>
                <span style={{ fontSize: "10px", fontWeight: "800", padding: "3px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "6px" }}>
                  aqi_lstm.keras
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Forecast for: <strong style={{ color: "#0f172a" }}>{selectedStation.shortName}</strong>
              </span>

              {/* 4 Forecast Step Pills */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "16px" }}>
                {forecast.map((step, idx) => {
                  const band = getBand(step.aqi);
                  return (
                    <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 8px", borderRadius: "12px", textAlign: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", display: "block" }}>{step.aqi}</span>
                      <span style={{ fontSize: "10px", color: "#64748b", display: "block", margin: "2px 0 6px 0" }}>{step.horizon} • {step.time}</span>
                      <span style={{ fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "100px", background: band.bg, color: band.color }}>
                        {band.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend Chart */}
            <ForecastChart forecastData={forecast} />
          </div>
        </div>

        {/* Monitoring Stations List */}
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
            Monitoring Stations ({stations.length})
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
    </div>
  );
}