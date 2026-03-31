"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bus, LayoutDashboard, Map, Settings, Route, 
  AlertTriangle, ShieldCheck, Activity, Users, FileText, TrendingUp, Menu, X
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
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Alerts & Events", href: "/alerts", icon: AlertTriangle },
    { name: "Device Health", href: "/devices", icon: Activity },
    { name: "Safety & Compliance", href: "/safety", icon: ShieldCheck },
  ]},
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-[#111827] rounded-lg transition-colors outline-none"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#0a0e1a] border-r border-[#1e293b] z-50 transform transition-transform duration-300 md:hidden flex flex-col shadow-2xl",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b] shrink-0">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Tracy<span className="text-primary">G</span></span>
          </Link>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-md bg-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_ITEMS.map((section) => (
            <div key={section.group}>
              <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2 px-2">
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
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-slate-400 hover:bg-[#111827] hover:text-slate-200"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-500")} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#1e293b] shrink-0">
          <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#111827] transition-colors">
            <Settings className="h-4 w-4 text-slate-500" />
            System Settings
          </Link>
          <Link href="/reports" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#111827] transition-colors mt-1">
            <FileText className="h-4 w-4 text-slate-500" />
            Export Reports
          </Link>
        </div>
      </div>
    </>
  );
}
