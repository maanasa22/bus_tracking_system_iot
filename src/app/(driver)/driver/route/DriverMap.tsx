"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "@/components/providers/socket-provider";

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BusIcon = new L.DivIcon({
  html: `<div style="background-color: #6366f1; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(99,102,241,0.6);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21"/></svg></div>`,
  className: "driver-bus-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const StopIcon = new L.DivIcon({
  html: `<div style="background-color: #f1f5f9; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #3b82f6;"></div>`,
  className: "stop-icon",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

interface DriverMapProps {
  busId: string;
  stops: { id: string; name: string; lat: number; lng: number; order: number }[];
  routeColor: string;
}

export default function DriverMap({ busId, stops, routeColor }: DriverMapProps) {
  const { socket, isConnected } = useSocket();
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Center on first stop or Bangalore
  const center: [number, number] = stops.length > 0 ? [stops[0].lat, stops[0].lng] : [12.9716, 77.5946];
  const routePath: [number, number][] = stops.map(s => [s.lat, s.lng]);

  // Auto-pan map to current position
  function MapUpdater({ pos }: { pos: [number, number] | null }) {
    const map = import("react-leaflet").then(mod => mod.useMap());
    // We can't easily use hooks dynamically imported like this inside the parent.
    // Better to just define it directly!
    return null;
  }
  
  // Watch GPS position
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported by browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        setCurrentPos([latitude, longitude]);
        setError(null); // Clear any previous errors on success

        // Emit location to socket if connected
        if (socket && isConnected && busId) {
          socket.emit("driver:locationUpdate", {
            busId,
            lat: latitude,
            lng: longitude,
            speed: speed ?? Math.floor(Math.random() * (60 - 30) + 30),
            heading: heading ?? Math.floor(Math.random() * 360),
            timestamp: position.timestamp,
          });
        }
      },
      (err) => {
        console.warn("GPS Error:", err.message);
        if (err.code === 1) {
          setError("Location access denied. Please enable GPS permissions.");
        } else if (err.code === 3) {
          setError("GPS Timeout. Waiting for signal...");
        } else {
          setError(`GPS Error: ${err.message}`);
        }
        
        // Fallback: use first stop location ONLY if we have absolutely nothing
        setCurrentPos(prev => {
           if (!prev && stops.length > 0) return [stops[0].lat, stops[0].lng];
           return prev;
        });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, isConnected, busId, stops]);

  // A sub-component to recenter the map when position updates dramatically
  const MapRecenter = ({ center }: { center: [number, number] }) => {
    // Dynamically require useMap to prevent SSR errors
    try {
      const { useMap } = require("react-leaflet");
      const map = useMap();
      useEffect(() => {
          map.panTo(center, { animate: true });
      }, [map, center[0], center[1]]);
    } catch(e) {}
    return null;
  };

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={currentPos || center}
        zoom={14}
        style={{ height: "100%", width: "100%", background: "#0a0e1a" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Dynamic Auto-Panning */}
        {currentPos && <MapRecenter center={currentPos} />}

        {/* Route polyline */}
        {routePath.length > 1 && (
          <Polyline positions={routePath} color={routeColor} weight={4} opacity={0.7} />
        )}

        {/* Stop markers */}
        {stops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={StopIcon}>
            <Popup>
              <strong>{stop.name}</strong>
              <br />Stop #{stop.order}
            </Popup>
          </Marker>
        ))}

        {/* Driver's current position */}
        {currentPos && (
          <Marker position={currentPos} icon={BusIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Connection status badge */}
      <div className="absolute top-20 right-4 z-[1000]">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur ${isConnected ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'}`}></div>
          {isConnected ? 'LIVE SYNC' : 'CONNECTING...'}
        </div>
      </div>

      {/* Error badge */}
      {error && (
        <div className="absolute top-32 right-4 z-[1000] bg-danger/90 text-white text-xs px-3 py-1 rounded shadow-lg backdrop-blur">
          {error}
        </div>
      )}
    </div>
  );
}
