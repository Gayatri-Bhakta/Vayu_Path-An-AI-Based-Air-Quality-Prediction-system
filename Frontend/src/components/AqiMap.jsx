import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const getMarkerColor = (aqi) => {
  if (aqi <= 100) return "#10b981"; // Satisfactory (Green)
  if (aqi <= 200) return "#f97316"; // Moderate (Orange)
  if (aqi <= 300) return "#ef4444"; // Poor (Red)
  return "#7f1d1d"; // Severe (Maroon)
};

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const container = map.getContainer();
    let ro;
    if (window.ResizeObserver && container) {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(container);
    }

    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      if (ro && container) ro.unobserve(container);
    };
  }, [map]);
  return null;
}

export default function AqiMap({ stations, selectedStation, onSelectStation }) {
  const center = [28.6300, 77.1900];
  const markerRefs = useRef({});

  // Dynamically open marker popups when the selected station changes (e.g. clicked card at the bottom)
  useEffect(() => {
    if (selectedStation) {
      const marker = markerRefs.current[selectedStation.id];
      if (marker) {
        // Run after map initialization has settled
        setTimeout(() => {
          marker.openPopup();
        }, 50);
      }
    }
  }, [selectedStation?.id]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "420px", borderRadius: "18px", overflow: "hidden", position: "relative" }}>
      <MapContainer center={center} zoom={10} scrollWheelZoom={true} style={{ width: "100%", height: "100%", minHeight: "420px" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={10}
          updateWhenIdle={false}
          updateWhenZooming={false}
        />
        <MapResizer />
        {stations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const color = getMarkerColor(st.aqi);
          return (
            <CircleMarker
              key={st.id}
              ref={(el) => {
                if (el) {
                  markerRefs.current[st.id] = el;
                } else {
                  delete markerRefs.current[st.id];
                }
              }}
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
                <div style={{ padding: "2px", fontSize: "12px", color: "#0f172a" }}>
                  <strong style={{ display: "block", marginBottom: "3px" }}>{st.name}</strong>
                  <span style={{ fontSize: "11px", color: "#475569" }}>AQI {st.aqi} • PM2.5 {st.pm25}</span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}