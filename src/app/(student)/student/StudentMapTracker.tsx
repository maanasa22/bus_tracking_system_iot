"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createBusIcon = () => 
  L.divIcon({
    html: `<div style="background-color: white; border: 3px solid #6366f1; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2.5 13h19"/><path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2z"/><path d="M2 17V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10"/><path d="M6 19v2"/><path d="M18 19v2"/></svg>
           </div>`,
    className: "bus-custom-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

export default function StudentMapTracker({ 
  busId, 
  stopLat, 
  stopLng, 
  stopName,
  assignedBusPlate
}: { 
  busId: string | undefined; 
  stopLat: number; 
  stopLng: number;
  stopName: string;
  assignedBusPlate: string;
}) {
  const { socket, isConnected } = useSocket();
  const [busLocation, setBusLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !busId) return;

    socket.emit("client:subscribeToBus", busId);

    socket.on("bus:locationUpdate", (data: { lat: number, lng: number }) => {
      setBusLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      socket.off("bus:locationUpdate");
    };
  }, [socket, isConnected, busId]);

  // A sub-component to recenter the map when bus position updates
  const MapRecenter = ({ center }: { center: [number, number] }) => {
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
    <div className="flex-1 w-full min-h-[40vh] relative z-0">
      <MapContainer 
        center={busLocation ? [busLocation.lat, busLocation.lng] : [stopLat, stopLng]} 
        zoom={14} 
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, background: "#0a0e1a" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        {/* Dynamic Auto-Panning to keep bus on screen */}
        {busLocation && <MapRecenter center={[busLocation.lat, busLocation.lng]} />}
        
        <Marker position={[stopLat, stopLng]}>
          <Popup>
             <strong>{stopName}</strong><br/>Your Pickup Location
          </Popup>
        </Marker>

        {busLocation && (
          <Marker position={[busLocation.lat, busLocation.lng]} icon={createBusIcon()}>
            <Popup>
              <strong>{assignedBusPlate}</strong><br/>Live Location
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[400]">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur ${isConnected ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'}`}></div>
          {isConnected ? 'LIVE TRACKING' : 'CONNECTING...'}
        </div>
      </div>
    </div>
  );
}
