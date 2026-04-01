export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Users, Search, Filter, Phone, Mail, CreditCard } from "lucide-react";

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({
    include: {
      user: true,
      bus: {
        include: { route: true }
      },
    },
    orderBy: { user: { name: "asc" } }
  });

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Users className="h-7 w-7 text-info" />
            Driver Profiles
          </h1>
          <p className="text-muted-foreground">Manage driver details, license info, and vehicle assignments.</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or license number..." 
            className="input pl-10 bg-[#111827] border-[#1e293b]"
          />
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div key={driver.id} className="glass-card p-6 relative overflow-hidden group">
            {/* Top */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-[#1e293b] shadow-md shrink-0">
                {driver.user.name?.charAt(0) || "D"}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-white truncate">{driver.user.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                    driver.user.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    {driver.user.isActive ? "Active" : "Inactive"}
                  </span>
                  {driver.bus?.route && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px]">
                      {driver.bus.route.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-slate-400">License:</span>
                <span className="font-mono font-bold text-slate-200 truncate">{driver.licenseNo || "N/A"}</span>
              </div>
              {driver.user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-slate-200">{driver.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200 truncate">{driver.user.email}</span>
              </div>
            </div>

            {/* Assigned Vehicle */}
            <div className="border-t border-[#1e293b] pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Assigned Vehicle</p>
                {driver.bus ? (
                  <p className="font-mono font-bold text-primary text-sm">{driver.bus.numberPlate}</p>
                ) : (
                  <p className="text-xs italic text-slate-500">Unassigned</p>
                )}
              </div>
              {driver.bus && (
                <span className="text-xs bg-[#111827] border border-[#1e293b] px-2 py-1 rounded font-mono text-slate-300">
                  {driver.bus.busId}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Drivers Found</h3>
          <p className="text-muted-foreground text-sm">There are no driver profiles in the system.</p>
        </div>
      )}
    </div>
  );
}
