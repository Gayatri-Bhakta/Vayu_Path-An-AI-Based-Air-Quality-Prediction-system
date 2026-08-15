import React from "react";

const getBand = (aqi) => {
  if (aqi <= 50) return { label: "Good", bg: "#dcfce7", color: "#166534" };
  if (aqi <= 100) return { label: "Satisfactory", bg: "#e0f2fe", color: "#0369a1" };
  if (aqi <= 200) return { label: "Moderate", bg: "#fef3c7", color: "#b45309" };
  if (aqi <= 300) return { label: "Poor", bg: "#ffedd5", color: "#c2410c" };
  if (aqi <= 400) return { label: "Very Poor", bg: "#f3e8ff", color: "#6b21a8" };
  return { label: "Severe", bg: "#fee2e2", color: "#991b1b" };
};

export default function StationCard({ station, isSelected, onClick }) {
  const band = getBand(station.aqi);

  return (
    <div
      onClick={onClick}
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
      <h4 style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
        {station.shortName}
      </h4>
      <div style={{ display: "flex", alignItems: "baseline", gap: "18px", marginBottom: "12px" }}>
        <div>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{station.aqi}</span>
          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>AQI</span>
        </div>
        <div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#334155" }}>{station.pm25}</span>
          <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>PM2.5</span>
        </div>
      </div>
      <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "100px", background: band.bg, color: band.color }}>
        {band.label}
      </span>
    </div>
  );
}