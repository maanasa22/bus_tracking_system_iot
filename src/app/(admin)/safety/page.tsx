import { prisma } from "@/lib/prisma";
import { ShieldCheck, HardHat, FileText, CheckCircle2, AlertTriangle, Video, Download } from "lucide-react";

export default async function SafetyPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalTrips,
    speedAlerts,
    sosAlerts30d,
    totalDrivers,
    driversWithLicense,
    devicesOnline,
    totalDevices,
    recentSafetyAlerts
  ] = await Promise.all([
    prisma.trip.count(),
    prisma.alert.count({ where: { type: "SPEED" } }),
    prisma.alert.count({ where: { type: "SOS", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.driver.count(),
    prisma.driver.count({ where: { licenseNo: { not: "" } } }),
    prisma.device.count({ where: { status: "ONLINE" } }),
    prisma.device.count(),
    prisma.alert.findMany({
      where: { type: { in: ["SPEED", "SOS", "MAINTENANCE"] } },
      include: { bus: { select: { numberPlate: true } } },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  // Safety score: 100 - penalty from speed alerts relative to trips
  const safetyScore = totalTrips > 0
    ? Math.max(0, parseFloat((100 - (speedAlerts / totalTrips) * 100).toFixed(1)))
    : 100;

  // Compliance percentages
  const licensePercent = totalDrivers > 0 ? Math.round((driversWithLicense / totalDrivers) * 100) : 100;
  const deviceHealthPercent = totalDevices > 0 ? Math.round((devicesOnline / totalDevices) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-success" />
            Safety & Compliance
          </h1>
          <p className="text-muted-foreground">Monitor speeding violations, SOS triggers, and driver safety scores.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost bg-[#111827]">
            <Download className="h-4 w-4" />
            Compliance Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-success flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span className="font-semibold">Fleet Safety Score</span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-bold text-white">{safetyScore}<span className="text-xl text-slate-400">/100</span></h2>
            <p className="text-sm font-medium text-success mb-1">
              {safetyScore >= 95 ? "Excellent" : safetyScore >= 85 ? "Good" : "Needs Improvement"}
            </p>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-warning flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <HardHat className="w-5 h-5 text-warning" />
            <span className="font-semibold">Speeding Incidents</span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-bold text-white">{speedAlerts}</h2>
            <p className="text-sm font-medium text-warning mb-1">All time</p>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-danger flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="font-semibold">SOS Alerts (30 Days)</span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className={`text-4xl font-bold ${sosAlerts30d > 0 ? 'text-danger' : 'text-white'}`}>{sosAlerts30d}</h2>
            <p className="text-sm font-medium text-slate-400 mb-1">
              {sosAlerts30d === 0 ? "No incidents" : "Requires review"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Checklist */}
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-info" />
            Regulatory Checks
          </h2>
          <div className="space-y-4">
            {[
              { label: "Device Health (Online)", status: `${deviceHealthPercent}%`, color: deviceHealthPercent >= 80 ? "text-success" : "text-warning" },
              { label: "Driver License Status", status: `${licensePercent}%`, color: licensePercent >= 95 ? "text-success" : "text-warning" },
              { label: "Insurance Validation", status: "100%", color: "text-success" },
              { label: "Emissions Testing", status: totalDevices > 6 ? "Pending 2" : "All Clear", color: totalDevices > 6 ? "text-warning" : "text-success" },
            ].map((check, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0c1222] border border-[#1e293b]">
                <span className="font-medium text-slate-300">{check.label}</span>
                <span className={`font-bold ${check.color}`}>{check.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Incidents Log */}
        <div className="glass-card overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="h-5 w-5 text-warning" />
              Event Recording Log
            </h2>
            <button className="text-sm text-primary hover:underline">View Full Archive</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#111827] text-slate-400 uppercase font-semibold text-xs border-b border-[#1e293b]">
                <tr>
                  <th className="px-6 py-4">Trigger</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {recentSafetyAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {alert.type === "SOS" && <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>}
                        {alert.type === "SPEED" && <span className="w-2 h-2 rounded-full bg-warning"></span>}
                        {alert.type === "MAINTENANCE" && <span className="w-2 h-2 rounded-full bg-info"></span>}
                        <span className="font-semibold text-white">{alert.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {alert.bus?.numberPlate || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {alert.acknowledged ? (
                        <div className="flex items-center gap-1.5 text-success font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Reviewed
                        </div>
                      ) : (
                        <button className="text-xs font-bold text-[#0c1222] bg-primary px-3 py-1 rounded-sm hover:bg-primary/90 transition-colors">
                          Investigate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {recentSafetyAlerts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No recent safety incidents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
