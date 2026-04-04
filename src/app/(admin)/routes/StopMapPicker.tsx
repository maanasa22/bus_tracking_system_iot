"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix default marker icons for Leaflet in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: "active-marker-icon",
});

L.Marker.prototype.options.icon = defaultIcon;

interface StopMarker {
  index: number;
  name: string;
  lat: number;
  lng: number;
}

interface StopMapPickerProps {
  stops: StopMarker[];
  activeStopIndex: number | null;
  onMapClick: (lat: number, lng: number) => void;
  routeColor: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function StopMapPicker({ stops, activeStopIndex, onMapClick, routeColor }: StopMapPickerProps) {
  // Center on Bengaluru by default, or on the first valid stop
  const validStops = stops.filter((s) => !isNaN(s.lat) && !isNaN(s.lng) && s.lat !== 0 && s.lng !== 0);
  const center: [number, number] = validStops.length > 0
    ? [validStops[0].lat, validStops[0].lng]
    : [12.9716, 77.5946]; // Bengaluru

  return (
    <div className="rounded-lg overflow-hidden border border-[#1e293b]" style={{ height: "250px" }}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />

        {validStops.map((stop) => (
          <Marker
            key={stop.index}
            position={[stop.lat, stop.lng]}
            icon={stop.index === activeStopIndex ? activeIcon : defaultIcon}
          >
            <Popup>
              <div className="text-xs font-semibold">
                <span className="text-slate-500">#{stop.index + 1}</span>{" "}
                {stop.name || "Unnamed Stop"}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
