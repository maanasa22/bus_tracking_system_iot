import { prisma } from "@/lib/prisma";
import { AlertTriangle, Bell, CheckCircle2, Info, Search, ShieldAlert, Clock, Bus as BusIcon, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AcknowledgeButton, MarkAllReadButton } from "./AlertActions";
import { ClientSearchFilter } from "@/components/ClientSearchFilter";

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
          <MarkAllReadButton />
          <button className="btn-danger">
            Export Log
          </button>
        </div>
      </div>

      <ClientSearchFilter
        items={alerts}
        searchKeys={["title", "message", "bus.numberPlate", "type"]}
        placeholder="Search alerts by title, type or vehicle..."
        filterKey="severity"
        filterOptions={[
          { label: "Critical", value: "CRITICAL" },
          { label: "Warning", value: "WARNING" },
          { label: "Info", value: "INFO" },
        ]}
      >
        {(filteredAlerts: any[]) => (
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-[#1e293b]">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success/50" />
              <p className="font-medium text-lg text-slate-300">All Clear</p>
              <p>No alerts matching your search.</p>
            </div>
          ) : filteredAlerts.map((alert: any) => (
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
                      <Clock className="w-3.5 h-3.5" />
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
                  <AcknowledgeButton alertId={alert.id} />
                )}
                <button className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        )}
      </ClientSearchFilter>
    </div>
  );
}

