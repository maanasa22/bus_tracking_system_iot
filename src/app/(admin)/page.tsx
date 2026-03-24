import { prisma } from "@/lib/prisma";
import { 
  Bus, Users, AlertTriangle, Route, ShieldAlert,
  Clock, Activity, MapPin
} from "lucide-react";

export default async function DashboardPage() {
  // Fetch real KPI data from the database
  const [
    totalBuses,
    activeBuses,
    totalStudents,
    totalRoutes,
    activeAlerts,
    tripsToday
  ] = await Promise.all([
    prisma.bus.count(),
    prisma.bus.count({ where: { status: "ACTIVE" } }),
    prisma.student.count(),
    prisma.route.count(),
    prisma.alert.count({ where: { acknowledged: false } }),
    prisma.trip.count({
      where: {
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ]);

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Executive Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of fleet operations and system health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost bg-[#111827]">
            <Clock className="w-4 h-4 mr-2" />
            Last 24 Hours
          </button>
          <button className="btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Fleet */}
        <div className="stat-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Fleet</p>
              <h3 className="text-3xl font-bold text-white flex items-baseline gap-2">
                {activeBuses} <span className="text-sm font-normal text-slate-500">/ {totalBuses}</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Bus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-success text-xs font-semibold bg-success/10 px-2 py-0.5 rounded">
              {Math.round((activeBuses / totalBuses) * 100)}% Online
            </span>
          </div>
        </div>

        {/* Total Students */}
        <div className="stat-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Students</p>
              <h3 className="text-3xl font-bold text-white">{totalStudents}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-slate-400 text-xs">Registered across {totalRoutes} routes</span>
          </div>
        </div>

        {/* Trips Today */}
        <div className="stat-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Trips Today</p>
              <h3 className="text-3xl font-bold text-white">{tripsToday}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-colors">
              <Route className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-success text-xs font-semibold bg-success/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Activity className="w-3 h-3" /> 12% vs yesterday
            </span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="stat-card group border-danger/20 hover:border-danger/50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Critical Alerts</p>
              <h3 className="text-3xl font-bold text-white">{activeAlerts}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center text-danger group-hover:bg-danger group-hover:text-white transition-colors">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {activeAlerts > 0 ? (
              <span className="text-danger text-xs font-semibold bg-danger/10 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Requires attention
              </span>
            ) : (
              <span className="text-success text-xs font-semibold bg-success/10 px-2 py-0.5 rounded">
                All systems nominal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column - Fleet Status Chart (Placeholder for now) */}
        <div className="lg:col-span-2 glass-card p-6 h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b]/50 to-transparent z-0"></div>
          <div className="relative z-10 text-center">
            <Activity className="w-16 h-16 text-primary/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fleet Analytics Empty State</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Recharts line charts will be placed here to visualize passenger load over time.</p>
          </div>
        </div>

        {/* Right Column - Map/Recent Activity */}
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" /> 
            Recent Tracking Events
          </h3>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <Bus className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">BUS-00{i}</span>
                    <span className="text-[10px] text-muted-foreground">Just now</span>
                  </div>
                  <p className="text-xs text-slate-400">Passed Mahalakshmi Layout stop with 32 passengers.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
