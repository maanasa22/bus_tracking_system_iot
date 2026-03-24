import { prisma } from "@/lib/prisma";
import { Bus, Plus, Search, Filter, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function FleetPage() {
  // Fetch buses with related driver and device info
  const buses = await prisma.bus.findMany({
    include: {
      driver: {
        include: { user: true }
      },
      device: true,
      route: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Bus className="h-7 w-7 text-primary" />
            Fleet Management
          </h1>
          <p className="text-muted-foreground">Manage vehicles, assign drivers, and monitor status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by registration, model, or driver..." 
            className="input pl-10 bg-[#111827] border-[#1e293b]"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="btn-ghost bg-[#111827] flex-1 sm:flex-none">
            <Filter className="h-4 w-4" />
            Status: All
          </button>
          <button className="btn-ghost bg-[#111827] flex-1 sm:flex-none">
            Route: All
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Info</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Assigned Driver</th>
                <th>Assigned Route</th>
                <th>Last Update</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No vehicles found in the fleet.
                  </td>
                </tr>
              ) : buses.map((bus) => (
                <tr key={bus.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center border border-slate-700 font-bold text-slate-300">
                        {bus.numberPlate.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{bus.numberPlate}</div>
                        <div className="text-xs text-muted-foreground">{bus.model} ({bus.year})</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-slate-300">{bus.capacity} seats</span>
                  </td>
                  <td>
                    {bus.status === "ACTIVE" && <span className="badge badge-success">Active</span>}
                    {bus.status === "INACTIVE" && <span className="badge badge-warning">Inactive</span>}
                    {bus.status === "MAINTENANCE" && <span className="badge badge-danger">Maintenance</span>}
                  </td>
                  <td>
                    {bus.driver ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                          {bus.driver.user.name.charAt(0)}
                        </div>
                        <span className="text-slate-300">{bus.driver.user.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {bus.route ? (
                      <Link href={`/routes/${bus.route.id}`} className="text-primary hover:underline font-medium">
                        {bus.route.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(bus.updatedAt), { addSuffix: true })}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-primary/10 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-danger rounded-md hover:bg-danger/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
