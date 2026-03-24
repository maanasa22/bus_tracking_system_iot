import { prisma } from "@/lib/prisma";
import { Route as RouteIcon, Plus, Search, Map, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function RoutesPage() {
  // Fetch routes with their stops and associated buses/students
  const routes = await prisma.route.findMany({
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: { students: true }
      },
      buses: true,
      schedules: {
        take: 1
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <RouteIcon className="h-7 w-7 text-secondary" />
            Route Management
          </h1>
          <p className="text-muted-foreground">Configure transit paths, stop sequences, and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/map" className="btn-ghost bg-[#111827]">
            <Map className="h-4 w-4" />
            View on Map
          </Link>
          <button className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Route
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search routes by name or stop..." 
            className="input pl-10 bg-[#111827] border-[#1e293b]"
          />
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map((route) => {
          const firstStop = route.stops[0];
          const lastStop = route.stops[route.stops.length - 1];
          const activeSchedule = route.schedules[0];

          const routeStudents = route.stops.flatMap(stop => stop.students);

          return (
            <div key={route.id} className="glass-card p-6 flex flex-col group relative overflow-hidden">
              {/* Card Background Decoration */}
              <div className="absolute -right-10 -top-10 text-secondary/5 group-hover:text-secondary/10 transition-colors pointer-events-none">
                <RouteIcon className="w-40 h-40" />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{route.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeSchedule ? `${activeSchedule.startTime} - ${activeSchedule.endTime}` : "No active schedule"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="text-success text-xs font-semibold bg-success/10 px-2 py-0.5 rounded">
                      {route.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex flex-col items-center justify-center bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 min-w-[60px]">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Buses</span>
                    <span className="text-lg font-bold text-white leading-none">{route.buses.length}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 min-w-[60px]">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Pax</span>
                    <span className="text-lg font-bold text-white leading-none">{routeStudents.length}</span>
                  </div>
                </div>
              </div>

              {/* Path visualization */}
              <div className="bg-[#0c1222] border border-[#1e293b] rounded-xl p-4 mb-6 flex-1 relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Origin</p>
                    <p className="font-medium text-slate-200 line-clamp-1">{firstStop?.name || "Unknown"}</p>
                  </div>
                  
                  <div className="flex flex-col items-center px-4">
                    <span className="text-[10px] text-muted-foreground font-medium bg-[#1e293b] px-2 py-0.5 rounded-full mb-1">
                      {route.stops.length} Stops
                    </span>
                    <div className="flex items-center text-secondary">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <div className="w-12 h-[2px] bg-gradient-to-r from-secondary to-transparent border-t border-dashed border-secondary/50"></div>
                      <ArrowRight className="w-4 h-4 ml-[-4px]" />
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Destination</p>
                    <p className="font-medium text-slate-200 line-clamp-1">{lastStop?.name || "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#1e293b] pt-4 mt-auto relative z-10">
                <div className="flex -space-x-2">
                  {routeStudents.slice(0, 4).map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-[#111827] flex items-center justify-center text-[10px] font-bold text-white">
                      SD
                    </div>
                  ))}
                  {routeStudents.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center text-[10px] font-bold text-slate-300">
                      +{routeStudents.length - 4}
                    </div>
                  )}
                </div>
                
                <Link href={`/routes/${route.id}`} className="btn-ghost py-1.5 px-3 text-sm flex items-center gap-1 group/btn">
                  Manage Route
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
