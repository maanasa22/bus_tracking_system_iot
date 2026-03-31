import { prisma } from "@/lib/prisma";
import { 
  Bus, Users, AlertTriangle, Route, ShieldAlert,
  Clock, Activity, MapPin, Bell
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DashboardChart } from "./DashboardChart";

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Fetch real KPI data from the database
  const [
    totalBuses,
    activeBuses,
    totalStudents,
    totalRoutes,
    activeAlerts,
    tripsToday,
    tripsYesterday,
    recentAlerts
  ] = await Promise.all([
    prisma.bus.count(),
    prisma.bus.count({ where: { status: "ACTIVE" } }),
    prisma.student.count(),
    prisma.route.count(),
    prisma.alert.count({ where: { acknowledged: false } }),
    prisma.trip.count({
      where: { startTime: { gte: todayStart } }
    }),
    prisma.trip.count({
      where: { startTime: { gte: yesterdayStart, lt: todayStart } }
    }),
    prisma.alert.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { bus: { select: { numberPlate: true } } }
    })
  ]);

  // Calculate trip delta
  const tripDelta = tripsYesterday > 0
    ? Math.round(((tripsToday - tripsYesterday) / tripsYesterday) * 100)
    : tripsToday > 0 ? 100 : 0;
  const tripDeltaSign = tripDelta >= 0 ? "+" : "";

  // Build 7-day chart data
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const [total, onTime] = await Promise.all([
      prisma.trip.count({ where: { startTime: { gte: dayStart, lt: dayEnd } } }),
      prisma.trip.count({ where: { startTime: { gte: dayStart, lt: dayEnd }, onTime: true } }),
    ]);
    
    chartData.push({
      day: dayStart.toLocaleDateString("en-IN", { weekday: "short" }),
      trips: total,
      onTime,
    });
  }

  // Severity helpers
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return <ShieldAlert className="h-4 w-4 text-danger" />;
      case "WARNING": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "SUCCESS": return <Activity className="h-4 w-4 text-success" />;
      default: return <Bell className="h-4 w-4 text-info" />;
    }
  };

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
              {totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0}% Online
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
            <span className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
              tripDelta >= 0 
                ? 'text-success bg-success/10' 
                : 'text-warning bg-warning/10'
            }`}>
              <Activity className="w-3 h-3" /> {tripDeltaSign}{tripDelta}% vs yesterday
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
        
        {/* Left Column - 7 Day Trip Chart */}
        <div className="lg:col-span-2 glass-card p-6 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Trip Volume — Last 7 Days
            </h3>
            <span className="text-xs text-muted-foreground bg-[#111827] px-2 py-1 rounded font-mono">
              {chartData.reduce((sum, d) => sum + d.trips, 0)} total
            </span>
          </div>
          <div className="flex-1">
            <DashboardChart data={chartData} />
          </div>
        </div>

        {/* Right Column - Real Alerts Feed */}
        <div className="glass-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" /> 
            Recent Events
          </h3>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.id} className="flex gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-sm truncate">{alert.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-1">{alert.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                    {alert.bus && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="font-mono text-secondary">{alert.bus.numberPlate}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-center text-slate-500 p-6">
                <div>
                  <Activity className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No recent events</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
