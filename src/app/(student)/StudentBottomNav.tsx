"use client";

import { useState } from "react";
import { Bell, Settings } from "lucide-react";

export function StudentBottomNav() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (label: string) => {
    setToast(`${label} — Coming Soon!`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      <button 
        onClick={() => showToast("Alerts")}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors relative"
      >
        <div className="absolute top-0 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-[#0f172a]"></div>
        <Bell className="h-6 w-6" />
        <span className="text-[10px] font-bold tracking-wide">Alerts</span>
      </button>

      <button 
        onClick={() => showToast("Settings")}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Settings className="h-6 w-6" />
        <span className="text-[10px] font-bold tracking-wide">Settings</span>
      </button>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] border border-[#334155] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}
