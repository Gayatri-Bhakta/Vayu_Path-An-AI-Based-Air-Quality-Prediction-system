import React from "react";
import { useLanguage } from "../context/LanguageContext";

const getBand = (aqi) => {
  if (aqi <= 100) return { label: "Satisfactory", bg: "#10b981", color: "#ffffff" };
  if (aqi <= 200) return { label: "Moderate", bg: "#f97316", color: "#ffffff" };
  if (aqi <= 300) return { label: "Poor", bg: "#ef4444", color: "#ffffff" };
  return { label: "Severe", bg: "#7f1d1d", color: "#ffffff" };
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

export default function StationCard({ station, isSelected, onClick }) {
  const { language } = useLanguage();
  const band = getBand(station.aqi);

  return (
    <div
      onClick={onClick}
      className={isSelected ? "contrast-card selected" : "contrast-card"}
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: isSelected ? "2px solid #0284c7" : "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "18px",
        cursor: "pointer",
        boxShadow: isSelected ? "0 10px 25px rgba(2, 132, 199, 0.12)" : "0 4px 12px rgba(0,0,0,0.02)",
        transition: "all 0.2s ease",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "900", color: "#0f172a" }}>
        {station.shortName}
      </h4>
      <div style={{ display: "flex", alignItems: "baseline", gap: "18px", marginBottom: "8px" }}>
        <div>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{station.aqi}</span>
          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>AQI</span>
        </div>
        <div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{station.pm25}</span>
          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>PM2.5</span>
        </div>
      </div>
      <div style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 12px 0", lineHeight: "1.4" }}>
        <div>{station.weather ? `${station.weather.temperature}°C • ${station.weather.desc}` : "27.0°C • Partly Cloudy"}</div>
        <div>{language === 'en' ? 'Wind' : 'हवा'}: {station.weather ? `${station.weather.wind_speed} m/s` : "0.6 m/s"}</div>
      </div>
      <span style={{ fontSize: "11px", fontWeight: "800", padding: "4px 12px", borderRadius: "100px", background: band.bg, color: band.color, display: "inline-block" }}>
        {getTranslatedLabel(band.label, language)}
      </span>
    </div>
  );
}