"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "@/components/providers/socket-provider";

// Fix Leaflet icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Icons
const BusIcon = new L.DivIcon({
  html: `<div style="background-color: #6366f1; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(99,102,241,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
  className: "custom-bus-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const StopIcon = new L.DivIcon({
  html: `<div style="background-color: #f1f5f9; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #3b82f6;"></div>`,
  className: "custom-stop-icon",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface Location { lat: number; lng: number }
interface Stop { id: string; name: string; lat: number; lng: number; order: number }
interface Route { id: string; name: string; color: string; stops: Stop[] }
interface Bus { 
  id: string; 
  busId: string;
  numberPlate: string; 
  status: string; 
  device: { lastLat: number | null; lastLng: number | null } | null;
  route: Pick<Route, "id" | "name" | "color"> | null;
}

export default function LiveMap({ 
  initialBuses, 
  routes 
}: { 
  initialBuses: Bus[], 
  routes: Route[] 
}) {
  const [mounted, setMounted] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const { socket, isConnected } = useSocket();

  // default center: Bangalore (since seed data is Bangalore)
  const center: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the global admin room to receive ALL bus updates
    socket.emit("admin:subscribeToAll");

    socket.on("bus:locationUpdate", (data: { busId: string, lat: number, lng: number }) => {
      setBuses((prev) => 
        prev.map(bus => {
          if (bus.busId === data.busId) {
             return {
                ...bus,
                device: {
                   ...bus.device,
                   lastLat: data.lat,
                   lastLng: data.lng
                }
             };
          }
          return bus;
        })
      );
    });

    return () => {
      socket.off("bus:locationUpdate");
    };
  }, [socket, isConnected]);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#111827] flex items-center justify-center border border-[#1e293b] rounded-xl overflow-hidden">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
          <p className="text-muted-foreground font-medium">Initializing Map Engine...</p>
        </div>
      </div>
    );
  }

  // Filter routes and buses if a route is selected
  const displayRoutes = activeRouteId ? routes.filter(r => r.id === activeRouteId) : routes;
  const displayBuses = activeRouteId 
    ? buses.filter(b => b.route?.id === activeRouteId) 
    : buses;

  return (
    <div className="relative w-full h-[calc(100vh-160px)] rounded-xl overflow-hidden border border-[#1e293b] shadow-2xl">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Dark map tiles matching the dark UI */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Draw Routes */}
        {displayRoutes.map((route) => {
          const positions: [number, number][] = route.stops.map(s => [s.lat, s.lng]);
          return (
            <div key={route.id}>
              {/* Route Polyline */}
              <Polyline 
                positions={positions} 
                pathOptions={{ 
                  color: route.color || '#3b82f6', 
                  weight: activeRouteId === route.id ? 5 : 3,
                  opacity: activeRouteId === route.id ? 1 : 0.6
                }} 
              />
              
              {/* Route Stops */}
              {route.stops.map(stop => (
                <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={StopIcon}>
                  <Popup className="custom-popup">
                    <div className="text-sm font-bold">{stop.name}</div>
                    <div className="text-xs text-muted-foreground">Order: {stop.order} | {route.name}</div>
                  </Popup>
                </Marker>
              ))}
            </div>
          );
        })}

        {/* Draw Buses */}
        {displayBuses.filter(b => b.device?.lastLat && b.device?.lastLng).map((bus) => (
          <Marker 
            key={bus.id} 
            position={[bus.device!.lastLat!, bus.device!.lastLng!]} 
            icon={BusIcon}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="p-1 min-w-[150px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">{bus.numberPlate}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${bus.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                    {bus.status}
                  </span>
                </div>
                {bus.route ? (
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bus.route.color || '#3b82f6' }}></div>
                    {bus.route.name}
                  </div>
                ) : (
                  <div className="text-xs italic text-slate-400">Unassigned</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Real-time Status Indicator */}
      <div className="absolute top-4 right-4 z-[400]">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-[#0c1222]/90 border border-[#1e293b] backdrop-blur ${isConnected ? 'text-success' : 'text-slate-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
          {isConnected ? 'LIVE FEED CONNECTED' : 'CONNECTING...'}
        </div>
      </div>

      {/* Floating Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-[#0c1222]/90 backdrop-blur-md border border-[#1e293b] rounded-xl p-4 shadow-xl w-64">
        <h3 className="text-white font-bold mb-3 tracking-tight">Focus Route</h3>
        <select 
          className="input w-full bg-[#111827] border-[#1e293b] text-sm py-2"
          value={activeRouteId || ""}
          onChange={(e) => setActiveRouteId(e.target.value || null)}
        >
          <option value="">All Routes</option>
          {routes.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        
        <div className="mt-4 pt-4 border-t border-[#1e293b] space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20"></div> Active Buses
            </span>
            <span className="text-white">{displayBuses.filter(b => b.status === 'ACTIVE').length}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border border-secondary"></div> Total Stops
            </span>
            <span className="text-white">{displayRoutes.reduce((acc, r) => acc + r.stops.length, 0)}</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #0a0e1a !important; font-family: 'Inter', sans-serif; }
        .custom-popup .leaflet-popup-content-wrapper { background: white; color: #1e293b; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); padding: 0; }
        .custom-popup .leaflet-popup-tip { background: white; }
      `}} />
    </div>
  );
}
