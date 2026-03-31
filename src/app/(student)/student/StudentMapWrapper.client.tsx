"use client";

import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

export const DynamicStudentMap = dynamic(() => import("./StudentMapTracker"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 min-h-[40vh] w-full bg-[#0a0e1a] flex flex-col items-center justify-center text-slate-500 z-0">
      <div className="animate-pulse flex flex-col items-center">
        <Activity className="w-8 h-8 text-primary/40 mb-2 animate-bounce" />
        <p className="text-sm font-medium tracking-wide uppercase text-slate-500">Locating Vehicle...</p>
      </div>
    </div>
  )
});
