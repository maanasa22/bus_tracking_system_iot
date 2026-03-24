"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";

export default function DriverLocationBroadcaster({ busId }: { busId: string }) {
  const { socket, isConnected } = useSocket();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !busId) return;

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    console.log(`📡 Initializing GPS Broadcast for Bus: ${busId}`);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        
        socket.emit("driver:locationUpdate", {
          busId,
          lat: latitude,
          lng: longitude,
          // If speed is null (e.g. desktop), mock it for demo logic
          speed: speed ?? Math.floor(Math.random() * (60 - 30) + 30),
          heading: heading ?? Math.floor(Math.random() * 360),
          timestamp: position.timestamp,
        });
      },
      (err) => {
        console.warn("GPS Error:", err.message);
        setError("Failed to acquire GPS location. Check permissions.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      console.log("🛑 Stopping GPS Broadcast");
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, isConnected, busId]);

  if (error) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-danger/90 text-white text-xs px-3 py-1 rounded shadow-lg backdrop-blur">
        {error}
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur ${isConnected ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'}`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'}`}></div>
        {isConnected ? 'LIVE SYNC' : 'CONNECTING...'}
      </div>
    </div>
  );
}
