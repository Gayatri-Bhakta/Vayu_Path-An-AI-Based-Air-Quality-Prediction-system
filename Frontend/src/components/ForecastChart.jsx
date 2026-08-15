import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function ForecastChart({ forecastData }) {
  return (
    <div style={{ width: "100%", height: "180px", marginTop: "12px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={forecastData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="horizon" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 450]} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#0284c7"
            strokeWidth={3}
            dot={{ r: 4, fill: "#0284c7" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}