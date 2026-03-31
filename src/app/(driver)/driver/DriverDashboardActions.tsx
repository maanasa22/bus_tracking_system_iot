"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { triggerSOS } from "@/app/actions/sos";

export function DriverDashboardActions({ 
  busId, 
  busPlate 
}: { 
  busId: string | null; 
  busPlate: string | null;
}) {
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const handleSOS = async () => {
    if (sosSent) return;
    
    const confirmed = window.confirm(
      "⚠️ EMERGENCY SOS\n\nThis will immediately alert the dispatch center.\n\nAre you sure you want to trigger SOS?"
    );
    if (!confirmed) return;

    setSosLoading(true);
    const result = await triggerSOS(busId, busPlate);
    setSosLoading(false);

    if (result.success) {
      setSosSent(true);
      setTimeout(() => setSosSent(false), 30000); // Reset after 30s
    } else {
      alert("Failed to send SOS. Please try again or call dispatch directly.");
    }
  };

  return (
    <button 
      onClick={handleSOS}
      disabled={sosLoading}
      className={`glass-card p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all ${
        sosSent 
          ? 'bg-danger/20 border-danger/40 text-danger' 
          : sosLoading 
            ? 'bg-[#1e293b] text-slate-400 animate-pulse' 
            : 'bg-[#1e293b] hover:bg-[#273248] text-danger'
      }`}
    >
      <ShieldAlert className={`h-8 w-8 ${sosSent ? 'animate-pulse' : ''}`} />
      <span className="font-bold text-sm">
        {sosSent ? 'SOS SENT ✓' : sosLoading ? 'SENDING...' : 'SOS Panic'}
      </span>
    </button>
  );
}
