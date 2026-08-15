import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const getMarkerColor = (aqi) => {
  if (aqi <= 50) return "#10b981";
  if (aqi <= 100) return "#0284c7";
  if (aqi <= 200) return "#d97706";
  if (aqi <= 300) return "#ea580c";
  if (aqi <= 400) return "#9333ea";
  return "#7f1d1d";
};

export default function AqiMap({ stations, selectedStation, onSelectStation }) {
  const center = [28.6300, 77.1900];

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "18px", overflow: "hidden" }}>
      <MapContainer center={center} zoom={10} scrollWheelZoom={true} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const color = getMarkerColor(st.aqi);
          return (
            <CircleMarker
              key={st.id}
              center={[st.lat, st.lng]}
              radius={isSelected ? 11 : 7}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: isSelected ? "#0f172a" : "#ffffff",
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onSelectStation(st),
              }}
            >
              <Popup>
                <div style={{ padding: "4px", fontSize: "12px", color: "#0f172a" }}>
                  <strong>{st.name}</strong>
                  <div style={{ marginTop: "4px" }}>
                    <span>AQI: <strong>{st.aqi}</strong> | PM2.5: {st.pm25}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}