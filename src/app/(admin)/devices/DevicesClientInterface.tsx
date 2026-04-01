"use client";

import { Cpu, Battery, Signal, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ClientSearchFilter } from "@/components/ClientSearchFilter";

export function DevicesClientInterface({ devices }: { devices: any[] }) {
  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Cpu className="h-7 w-7 text-info" />
            Device Health
          </h1>
          <p className="text-muted-foreground">Manage IoT trackers, monitor battery levels, and firmware versions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost bg-[#111827]">
            <RefreshCw className="h-4 w-4" />
            Ping All
          </button>
          <button className="btn-primary">
            Provision Device
          </button>
        </div>
      </div>

      <ClientSearchFilter
        items={devices}
        searchKeys={["serialNumber", "firmware", "bus.numberPlate"]}
        placeholder="Search by serial number, firmware, or bus..."
        filterKey="status"
        filterOptions={[
          { label: "Online", value: "ONLINE" },
          { label: "Warning", value: "WARNING" },
          { label: "Offline", value: "OFFLINE" },
        ]}
      >
        {(filteredDevices: any[]) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-[#111827]/50 rounded-xl border border-dashed border-slate-700">
                <Cpu className="h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No matching devices</h3>
                <p className="text-slate-400 max-w-sm">
                  We couldn't find any IoT trackers that match your current search and filter criteria.
                </p>
              </div>
            ) : filteredDevices.map(device => (
              <div key={device.id} className="glass-card p-6 flex flex-col group relative overflow-hidden transition-all hover:bg-[#111827]">
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#1e293b] rounded-lg flex items-center justify-center">
                      <Cpu className={`h-5 w-5 ${
                        device.status === 'ONLINE' ? 'text-success' : 
                        device.status === 'WARNING' ? 'text-warning' : 'text-danger'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold leading-tight">{device.serialNumber}</h3>
                      <span className="text-xs text-muted-foreground font-mono">v{device.firmware}</span>
                    </div>
                  </div>
                  <div>
                    {device.status === 'ONLINE' && <span className="badge badge-success shadow-[0_0_10px_rgba(22,163,74,0.2)]">Online</span>}
                    {device.status === 'WARNING' && <span className="badge badge-warning">Warning</span>}
                    {device.status === 'OFFLINE' && <span className="badge badge-danger">Offline</span>}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
                  <div className="bg-[#0c1222] p-3 rounded-lg border border-[#1e293b]">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Battery className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Battery</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-xl font-bold leading-none ${device.battery < 20 ? 'text-danger' : 'text-white'}`}>
                        {device.battery}%
                      </span>
                      {device.battery < 20 && <AlertCircle className="w-4 h-4 text-danger mb-0.5 animate-pulse" />}
                    </div>
                    <div className="w-full bg-[#1e293b] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${device.battery < 20 ? 'bg-danger' : device.battery < 50 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${device.battery}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-[#0c1222] p-3 rounded-lg border border-[#1e293b]">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Signal className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Signal</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold leading-none text-white">{device.signal}</span>
                      <span className="text-xs text-muted-foreground mb-0.5">/ 4 bars</span>
                    </div>
                    <div className="flex items-end gap-1 h-3 mt-2">
                      {[1, 2, 3, 4].map(bar => (
                        <div 
                          key={bar} 
                          className={`w-full rounded-sm ${bar <= device.signal ? 'bg-info' : 'bg-[#1e293b]'}`}
                          style={{ height: `${(bar / 4) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#1e293b] pt-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="uppercase tracking-wider font-semibold mb-0.5 text-[#64748b]">Assigned Bus</span>
                    <span className="text-white font-medium">{device.bus?.numberPlate || 'Unassigned'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="uppercase tracking-wider font-semibold mb-0.5 text-[#64748b]">Last Sync</span>
                    <span className="text-white font-medium">
                      {device.lastPing ? formatDistanceToNow(new Date(device.lastPing), { addSuffix: true }) : 'Never'}
                    </span>
                  </div>
                </div>
                
                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
                  <button className="btn-primary py-2 px-4 shadow-lg">Settings</button>
                  <button className="btn-ghost bg-white/10 text-white hover:bg-white/20 py-2 px-4 shadow-lg">Logs</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ClientSearchFilter>
    </div>
  );
}
