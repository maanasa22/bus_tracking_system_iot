import { prisma } from "@/lib/prisma";
import { AlertTriangle, Bell, CheckCircle2, Info, Search, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({
    include: {
      bus: {
        select: { numberPlate: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return <ShieldAlert className="h-5 w-5 text-danger" />;
      case "WARNING": return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "SUCCESS": return <CheckCircle2 className="h-5 w-5 text-success" />;
      default: return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return <span className="badge badge-danger">Critical</span>;
      case "WARNING": return <span className="badge badge-warning">Warning</span>;
      case "SUCCESS": return <span className="badge badge-success">Resolved</span>;
      default: return <span className="badge badge-info">Info</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Bell className="h-7 w-7 text-danger" />
            Alerts & Events
          </h1>
          <p className="text-muted-foreground">Monitor system anomalies, safety alerts, and operational events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost bg-[#111827]">
            Mark All Read
          </button>
          <button className="btn-danger">
            Export Log
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search alerts by title or vehicle..." 
            className="input pl-10 bg-[#111827] border-[#1e293b]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select className="input bg-[#111827] border-[#1e293b] flex-1 sm:flex-none">
            <option>All Severities</option>
            <option>Critical Only</option>
            <option>Warnings</option>
          </select>
          <select className="input bg-[#111827] border-[#1e293b] flex-1 sm:flex-none">
            <option>All Statuses</option>
            <option>Unacknowledged</option>
            <option>Acknowledged</option>
          </select>
        </div>
      </div>

      {/* Alerts Timeline / List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-[#1e293b]">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success/50" />
              <p className="font-medium text-lg text-slate-300">All Clear</p>
              <p>No active alerts or events found.</p>
            </div>
          ) : alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-colors hover:bg-slate-800/50 ${!alert.acknowledged ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold ${!alert.acknowledged ? 'text-white' : 'text-slate-300'}`}>
                      {alert.title}
                    </h3>
                    {getSeverityBadge(alert.severity)}
                    {!alert.acknowledged && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 max-w-2xl mb-2">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                    {alert.bus && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="flex items-center gap-1 uppercase tracking-wider text-secondary">
                          <BusIcon className="w-3.5 h-3.5" />
                          {alert.bus.numberPlate}
                        </span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="uppercase tracking-wider">Type: {alert.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:ml-auto">
                {!alert.acknowledged && (
                  <button className="btn-primary py-1.5 px-3 text-sm">
                    Acknowledge
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
                  <MoreVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper icons required for the UI
function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  );
}

function BusIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  );
}

function MoreVerticalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
  );
}
