"use client";

import dynamic from "next/dynamic";
import { Navigation } from "lucide-react";

export const DynamicDriverMap = dynamic(() => import("./DriverMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#0a0e1a] z-0 overflow-hidden flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <Navigation className="w-8 h-8 text-primary/40 mb-2 animate-bounce" />
        <p className="text-sm font-medium tracking-wide uppercase text-slate-500">Loading Map...</p>
      </div>
    </div>
  ),
});
