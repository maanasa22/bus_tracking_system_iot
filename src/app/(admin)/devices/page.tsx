import { prisma } from "@/lib/prisma";
import { Cpu, Battery, Signal, Wifi, Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ClientSearchFilter } from "@/components/ClientSearchFilter";

export default async function DevicesPage() {
  const devices = await prisma.device.findMany({
    include: {
      bus: {
        select: { numberPlate: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate aggregates
  const total = devices.length;
  const online = devices.filter(d => d.status === "ONLINE").length;
  const warning = devices.filter(d => d.status === "WARNING").length;
  const offline = devices.filter(d => d.status === "OFFLINE").length;

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Devices</p>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="glass-card p-4 border-b-4 border-b-success">
          <p className="text-sm font-medium text-muted-foreground mb-1">Online (Syncing)</p>
          <p className="text-3xl font-bold text-success">{online}</p>
        </div>
        <div className="glass-card p-4 border-b-4 border-b-warning">
          <p className="text-sm font-medium text-muted-foreground mb-1">Low Battery / Weak Signal</p>
          <p className="text-3xl font-bold text-warning">{warning}</p>
        </div>
        <div className="glass-card p-4 border-b-4 border-b-danger">
          <p className="text-sm font-medium text-muted-foreground mb-1">Offline</p>
          <p className="text-3xl font-bold text-danger">{offline}</p>
        </div>
      </div>

      <ClientSearchFilter
        items={devices}
        searchKeys={["deviceId", "macAddress", "firmware", "bus.numberPlate"]}
        placeholder="Search by Device ID, MAC, or Bus..."
        filterKey="status"
        filterOptions={[
          { label: "Online", value: "ONLINE" },
          { label: "Warning", value: "WARNING" },
          { label: "Offline", value: "OFFLINE" },
        ]}
      >
        {(filteredDevices: any[]) => (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDevices.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 py-12 text-center text-muted-foreground">
            <p>No devices matching your search.</p>
          </div>
        ) : filteredDevices.map((device: any) => (
          <div key={device.id} className="glass-card p-5 relative overflow-hidden group">
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              device.status === 'ONLINE' ? 'bg-success' : 
              device.status === 'WARNING' ? 'bg-warning' : 'bg-danger'
            }`}></div>

            <div className="flex justify-between items-start mb-4 pt-1">
              <div>
                <h3 className="font-bold text-lg text-white font-mono flex items-center gap-2">
                  <Wifi className={`w-4 h-4 ${
                    device.status === 'ONLINE' ? 'text-success' : 
                    device.status === 'WARNING' ? 'text-warning' : 'text-danger'
                  }`} />
                  {device.deviceId}
                </h3>
                <p className="text-sm text-muted-foreground">
                  FW: {device.firmware}
                </p>
              </div>
              <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                device.status === 'ONLINE' ? 'bg-success/10 text-success' : 
                device.status === 'WARNING' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
              }`}>
                {device.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
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
                {/* Battery Bar */}
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
                {/* Signal Bars */}
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

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#1e293b] pt-4">
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
            <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
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
