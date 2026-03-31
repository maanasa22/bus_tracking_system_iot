"use client";

import { useState } from "react";
import { MapPin, CheckCircle2, SkipForward, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { triggerSOS } from "@/app/actions/sos";
import { useSocket } from "@/components/providers/socket-provider";

interface StopData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  studentCount: number;
}

interface RouteProgressPanelProps {
  stops: StopData[];
  routeDuration: number;
  routeDistance: number;
  busId: string | null;
  busPlate: string | null;
}

export default function RouteProgressPanel({ 
  stops, 
  routeDuration, 
  routeDistance, 
  busId, 
  busPlate 
}: RouteProgressPanelProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [completedStops, setCompletedStops] = useState<number[]>([]);
  const [skippedStops, setSkippedStops] = useState<number[]>([]);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const { socket, isConnected } = useSocket();

  const isRouteComplete = currentStopIndex >= stops.length;
  const currentStop = !isRouteComplete ? stops[currentStopIndex] : null;
  const totalStops = stops.length;

  // Calculate ETA and distance for current stop
  const etaPerStop = Math.round(routeDuration / totalStops);
  const distPerStop = parseFloat((routeDistance / totalStops).toFixed(1));
  const currentETA = etaPerStop * (currentStopIndex + 1);
  const currentDist = distPerStop * (totalStops - currentStopIndex);

  const handleArrived = () => {
    if (isRouteComplete) return;
    setCompletedStops(prev => [...prev, currentStopIndex]);
    
    // Emit socket event for admin visibility
    if (socket && isConnected && busId) {
      socket.emit("driver:stopArrived", {
        busId,
        stopIndex: currentStopIndex,
        stopName: currentStop?.name,
        timestamp: Date.now(),
      });
    }

    setCurrentStopIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    if (isRouteComplete) return;
    setSkippedStops(prev => [...prev, currentStopIndex]);
    setCurrentStopIndex(prev => prev + 1);
  };

  const handleSOS = async () => {
    if (sosSent) return;
    const confirmed = window.confirm(
      "⚠️ EMERGENCY SOS\n\nThis will immediately alert the dispatch center.\n\nAre you sure?"
    );
    if (!confirmed) return;
    
    setSosLoading(true);
    const result = await triggerSOS(busId, busPlate);
    setSosLoading(false);

    if (result.success) {
      setSosSent(true);
      setTimeout(() => setSosSent(false), 30000);
    }
  };

  return (
    <>
      {/* Top HUD */}
      <div className="z-[1000] p-4 sticky top-0 bg-gradient-to-b from-[#0c1222]/90 to-transparent flex justify-between items-start">
        <Link href="/driver" className="w-10 h-10 rounded-full bg-[#111827] border border-[#1e293b] flex items-center justify-center text-slate-300 shadow-xl backdrop-blur-md">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        {/* Stop Progress Counter */}
        <div className="bg-[#111827]/90 backdrop-blur border border-[#1e293b] rounded-full px-3 py-1.5 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">STOP</span>
          <span className="text-sm font-black text-white">
            {Math.min(currentStopIndex + 1, totalStops)}/{totalStops}
          </span>
        </div>

        <button 
          onClick={handleSOS}
          disabled={sosLoading}
          className={`rounded-full px-4 py-2 font-bold text-sm shadow-xl flex items-center gap-2 ${
            sosSent 
              ? 'bg-danger/30 text-danger border border-danger/40' 
              : sosLoading 
                ? 'bg-slate-700 text-slate-400 animate-pulse'
                : 'bg-danger text-white animate-pulse'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          {sosSent ? 'SENT ✓' : sosLoading ? '...' : 'SOS'}
        </button>
      </div>

      {/* Bottom Control Panel */}
      <div className="z-[1000] mt-auto bg-[#0c1222]/95 backdrop-blur-xl border-t border-[#1e293b] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-12 h-1.5 bg-[#1e293b] rounded-full mx-auto my-3"></div>
        
        <div className="px-5 pb-6">
          {!isRouteComplete ? (
            <>
              <div className="flex justify-between items-end mb-4">
                <div>
                   <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Next Stop</p>
                   <h2 className="text-2xl font-bold text-white">{currentStop?.name}</h2>
                </div>
                <div className="text-right">
                   <h2 className="text-3xl font-black text-white">
                     {etaPerStop}<span className="text-lg text-slate-400 font-bold ml-1">min</span>
                   </h2>
                   <p className="text-sm text-muted-foreground font-medium">{distPerStop} km away</p>
                </div>
              </div>

              <div className="flex bg-[#111827] rounded-xl p-3 border border-[#1e293b] justify-between items-center mb-5">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                     <MapPin className="h-5 w-5 text-success" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-200">
                        {currentStop?.studentCount || 0} Student{(currentStop?.studentCount || 0) !== 1 ? 's' : ''} Waiting
                      </p>
                      <p className="text-xs text-muted-foreground">Please ensure safe boarding</p>
                   </div>
                 </div>
              </div>

              {/* Completed stops mini-feed */}
              {completedStops.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {completedStops.map(idx => (
                    <div key={idx} className="flex items-center gap-1 bg-success/10 text-success border border-success/20 rounded-full px-2 py-0.5 text-xs font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      {stops[idx]?.name?.split(' ').slice(0, 2).join(' ')}
                    </div>
                  ))}
                  {skippedStops.map(idx => (
                    <div key={`s${idx}`} className="flex items-center gap-1 bg-warning/10 text-warning border border-warning/20 rounded-full px-2 py-0.5 text-xs font-bold">
                      <SkipForward className="h-3 w-3" />
                      {stops[idx]?.name?.split(' ').slice(0, 2).join(' ')}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={handleArrived}
                   className="bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex justify-center items-center gap-2"
                 >
                   <CheckCircle2 className="h-5 w-5" /> Arrived
                 </button>
                 <button 
                   onClick={handleSkip}
                   className="bg-[#1e293b] text-white font-bold py-4 rounded-xl active:scale-95 transition-transform flex justify-center items-center gap-2"
                 >
                   <SkipForward className="h-4 w-4" /> Skip Stop
                 </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Route Complete! 🎉</h2>
              <p className="text-slate-400 mb-1">
                {completedStops.length} arrived · {skippedStops.length} skipped
              </p>
              <p className="text-sm text-muted-foreground mb-5">All stops have been covered.</p>
              <Link 
                href="/driver" 
                className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-lg"
              >
                Return to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
