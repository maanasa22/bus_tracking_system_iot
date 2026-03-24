"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bus, LayoutDashboard, Map, Settings, Route, 
  AlertTriangle, ShieldCheck, Activity, Users, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { group: "Overview", items: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Live Map", href: "/map", icon: Map },
  ]},
  { group: "Operations", items: [
    { name: "Fleet Management", href: "/fleet", icon: Bus },
    { name: "Routes & Stops", href: "/routes", icon: Route },
    { name: "Driver Profiles", href: "/drivers", icon: Users },
  ]},
  { group: "Monitoring", items: [
    { name: "Alerts & Events", href: "/alerts", icon: AlertTriangle },
    { name: "Device Health", href: "/devices", icon: Activity },
    { name: "Safety & Compliance", href: "/safety", icon: ShieldCheck },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#0a0e1a] border-r border-[#1e293b] hidden md:flex flex-col sticky top-0 shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e293b] shrink-0">
        <Link href="/" className="flex items-center gap-2 group outline-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
            <Bus className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Tracy<span className="text-primary">G</span></span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
        {NAV_ITEMS.map((section) => (
          <div key={section.group}>
            <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3 px-2">
              {section.group}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-slate-400 hover:bg-[#111827] hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-500")} />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-1 h-4 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#1e293b] shrink-0">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#111827] transition-colors">
          <Settings className="h-4 w-4 text-slate-500" />
          System Settings
        </Link>
        <Link href="/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#111827] transition-colors mt-1">
          <FileText className="h-4 w-4 text-slate-500" />
          Export Reports
        </Link>
      </div>
    </aside>
  );
}
