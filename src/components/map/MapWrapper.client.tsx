"use client";

import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

export const DynamicLiveMap = dynamic(() => import("@/components/map/LiveMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-160px)] bg-[#111827] flex items-center justify-center border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
      <div className="animate-pulse flex flex-col items-center">
        <Activity className="w-12 h-12 text-primary/40 mb-4 animate-bounce" />
        <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Loading Live Feed...</p>
      </div>
    </div>
  )
});
