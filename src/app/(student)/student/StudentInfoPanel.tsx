"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { Navigation, AlertTriangle, CheckCircle2, Share2, MapPin } from "lucide-react";

interface StudentInfoPanelProps {
  busId: string;
  stopLat: number;
  stopLng: number;
  stopName: string;
  assignedBusPlate: string;
  routeDuration: number;
}

// Haversine formula — returns distance in km between two GPS coordinates
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StudentInfoPanel({
  busId,
  stopLat,
  stopLng,
  stopName,
  assignedBusPlate,
  routeDuration,
}: StudentInfoPanelProps) {
  const { socket, isConnected } = useSocket();
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number; speed: number } | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected || !busId) return;

    socket.emit("client:subscribeToBus", busId);

    socket.on("bus:locationUpdate", (data: { lat: number; lng: number; speed?: number }) => {
      setBusLocation({ lat: data.lat, lng: data.lng, speed: data.speed || 30 });
    });

    return () => {
      socket.off("bus:locationUpdate");
    };
  }, [socket, isConnected, busId]);

  // Calculate live distance and ETA
  let distanceKm = 0;
  let etaMinutes = 0;
  let status: "approaching" | "arrived" | "waiting" = "waiting";

  if (busLocation) {
    distanceKm = haversineDistance(busLocation.lat, busLocation.lng, stopLat, stopLng);
    
    // ETA: distance / speed (km/h → minutes)
    const speedKmh = busLocation.speed > 0 ? busLocation.speed : 25; // Assume 25 km/h if stationary
    etaMinutes = Math.max(1, Math.round((distanceKm / speedKmh) * 60));

    if (distanceKm < 0.1) {
      status = "arrived";
    } else {
      status = "approaching";
    }
  }

  const handleShare = async () => {
    const shareUrl = `https://www.google.com/maps?q=${stopLat},${stopLng}`;
    const shareData = {
      title: `My Pickup Location — ${stopName}`,
      text: `Track my school bus pickup at ${stopName}. Bus ${assignedBusPlate} is ${busLocation ? `${distanceKm.toFixed(1)} km away (ETA: ${etaMinutes} min)` : 'en route'}.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or API failed, silently ignore
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareData.text}\n${shareUrl}`);
      alert("Pickup location copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#0f172a] border-t border-slate-800 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 pb-16">
      <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto my-3 mt-4"></div>

      <div className="p-5 pt-2">
        {/* Status & ETA Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Live Status</span>
            {status === "arrived" ? (
              <h2 className="text-3xl font-black text-success">Arrived! 🎉</h2>
            ) : busLocation ? (
              <h2 className="text-3xl font-black text-white">
                {etaMinutes <= 10 ? "On Time" : "Delayed"}
              </h2>
            ) : (
              <h2 className="text-2xl font-black text-slate-400">Awaiting Signal</h2>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Arrival in</span>
            {busLocation ? (
              <div className="flex items-end gap-1 justify-end text-primary">
                <h2 className="text-3xl font-black leading-none text-primary">
                  {status === "arrived" ? "0" : etaMinutes}
                </h2>
                <span className="font-bold pb-0.5 text-primary">mins</span>
              </div>
            ) : (
              <div className="flex items-end gap-1 justify-end text-slate-500">
                <h2 className="text-3xl font-black leading-none">—</h2>
                <span className="font-bold pb-0.5">mins</span>
              </div>
            )}
          </div>
        </div>

        {/* Approaching Info Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              status === "arrived" 
                ? 'bg-success/10 border border-success/20 text-success' 
                : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
            }`}>
              {status === "arrived" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Navigation className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-200">
                {status === "arrived" ? "Bus has arrived!" : status === "approaching" ? "Approaching Stop" : "Waiting for bus"}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                {busLocation ? (
                  <>
                    <MapPin className="w-3 h-3 text-primary" />
                    {distanceKm < 1 
                      ? `${Math.round(distanceKm * 1000)}m away` 
                      : `${distanceKm.toFixed(1)}km away`
                    }
                    {busLocation.speed > 0 && (
                      <span className="text-slate-500 ml-1">· {Math.round(busLocation.speed)} km/h</span>
                    )}
                  </>
                ) : (
                  "Waiting for driver to start broadcasting..."
                )}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-700/50 my-3"></div>

          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-medium text-slate-400">Pick-up Location</p>
            <p className="text-sm font-bold text-slate-200">{stopName}</p>
          </div>
          
          <div className="flex justify-between items-center px-1 mt-2">
            <p className="text-xs font-medium text-slate-400">Vehicle</p>
            <p className="text-sm font-bold font-mono text-primary">{assignedBusPlate}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-700 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" /> Share Location
          </button>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold px-5 py-3.5 rounded-xl hover:bg-amber-500/20 transition-colors flex items-center gap-2 shadow-sm text-sm"
          >
            <AlertTriangle className="h-4 w-4" /> Issue?
          </button>
        </div>

        {/* Issue Modal */}
        {showIssueModal && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Report an Issue</h3>
              <p className="text-sm text-slate-400 mb-5">
                If your bus is significantly delayed or you&apos;re facing any problem, please contact the transport coordinator directly:
              </p>
              <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl p-4 mb-5">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Transport Helpline</p>
                <a href="tel:+919876543210" className="text-lg font-bold text-primary">
                  +91 98765 43210
                </a>
              </div>
              <button 
                onClick={() => setShowIssueModal(false)}
                className="w-full bg-[#1e293b] text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
