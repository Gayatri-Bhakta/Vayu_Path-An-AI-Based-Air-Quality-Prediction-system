import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Helper to determine AQI color bands matching the dashboard system
const getBand = (aqi) => {
  if (aqi <= 100) return { label: "Satisfactory", bg: "#dcfce7", color: "#16a34a" };
  if (aqi <= 200) return { label: "Moderate", bg: "#ffedd5", color: "#ea580c" };
  if (aqi <= 300) return { label: "Poor", bg: "#fee2e2", color: "#dc2626" };
  return { label: "Severe", bg: "#fca5a5", color: "#991b1b" };
};

// Premium Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const aqi = data.aqi;
    const band = getBand(aqi);
    return (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "14px",
          padding: "12px 16px",
          color: "white",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Forecast: {data.horizon} ({data.time})
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", lineHeight: "1" }}>{aqi}</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "2px 8px",
              borderRadius: "100px",
              background: band.bg,
              color: band.color,
            }}
          >
            {band.label}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Premium Custom Dots
const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  const aqi = payload.aqi;
  const band = getBand(aqi);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={band.color}
      stroke="#ffffff"
      strokeWidth={2}
      style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }}
    />
  );
};

// Premium Custom Active Dot (on Hover)
const CustomActiveDot = (props) => {
  const { cx, cy, payload } = props;
  if (!payload) return null;
  const aqi = payload.aqi;
  const band = getBand(aqi);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={8}
      fill={band.color}
      stroke="#ffffff"
      strokeWidth={2.5}
      style={{ filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.25))" }}
    />
  );
};

export default function ForecastChart({ forecastData }) {
  return (
    <div style={{ width: "100%", height: "180px", marginTop: "12px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 18, right: 12, left: 12, bottom: 0 }}>
          <defs>
            {/* Soft vertical gradient for area fill */}
            <linearGradient id="aqiColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity={0.35} /> {/* Severe/Very Poor */}
              <stop offset="50%" stopColor="#ea580c" stopOpacity={0.2} />  {/* Poor */}
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.03} /> {/* Good */}
            </linearGradient>

            {/* Vibrant gradient for stroke line shifting with AQI levels */}
            <linearGradient id="aqiLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* Clean axis styling */}
          <XAxis
            dataKey="horizon"
            stroke="#94a3b8"
            fontSize={11}
            fontWeight={600}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            dy={6}
          />
          <YAxis hide={true} />

          {/* Upgraded hover tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }} />

          {/* Area graphic representation */}
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="url(#aqiLine)"
            strokeWidth={3}
            fill="url(#aqiColor)"
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
            label={{ fill: "#475569", fontSize: 10.5, fontWeight: "800", position: "top", offset: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}