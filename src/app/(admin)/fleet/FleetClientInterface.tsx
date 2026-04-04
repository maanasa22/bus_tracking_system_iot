"use client";

import { Bus, Plus, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClientSearchFilter } from "@/components/ClientSearchFilter";
import { createBus, updateBus, archiveBus } from "@/app/actions/fleet";

interface FleetClientInterfaceProps {
  buses: any[];
  availableDrivers: any[];
  availableRoutes: any[];
}

export function FleetClientInterface({ buses, availableDrivers, availableRoutes }: FleetClientInterfaceProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteBusId, setDeleteBusId] = useState<string | null>(null);
  
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const resetForm = () => {
    setIsEditOpen(false);
    setIsAddOpen(false);
    setDeleteBusId(null);
    setSelectedBus(null);
    setErrorStatus(null);
    setIsSubmitting(false);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorStatus(null);
    const formData = new FormData(e.currentTarget);
    
    const res = await createBus({
      numberPlate: formData.get("numberPlate") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string) || new Date().getFullYear(),
      capacity: parseInt(formData.get("capacity") as string) || 52,
      status: formData.get("status") as string,
      driverId: (formData.get("driverId") as string) || null,
      routeId: (formData.get("routeId") as string) || null,
    });

    if (res.error) {
      setErrorStatus(res.error);
      setIsSubmitting(false);
    } else {
      resetForm();
      router.refresh();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorStatus(null);
    const formData = new FormData(e.currentTarget);
    
    const res = await updateBus(selectedBus.id, {
      numberPlate: formData.get("numberPlate") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string) || new Date().getFullYear(),
      capacity: parseInt(formData.get("capacity") as string) || 52,
      status: formData.get("status") as string,
      driverId: (formData.get("driverId") as string) || null,
      routeId: (formData.get("routeId") as string) || null,
    });

    if (res.error) {
      setErrorStatus(res.error);
      setIsSubmitting(false);
    } else {
      resetForm();
      router.refresh();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBusId) return;
    setIsSubmitting(true);
    const res = await archiveBus(deleteBusId);
    if (res.error) {
      setErrorStatus(res.error);
      setIsSubmitting(false);
    } else {
      resetForm();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <Bus className="h-7 w-7 text-primary" />
            Fleet Management
          </h1>
          <p className="text-muted-foreground">Manage vehicles, assign drivers, and monitor status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      <ClientSearchFilter
        items={buses}
        searchKeys={["numberPlate", "model", "driver.user.name"]}
        placeholder="Search by registration, model, or driver..."
        filterKey="status"
        filterOptions={[
          { label: "Active", value: "ACTIVE" },
          { label: "Inactive", value: "INACTIVE" },
          { label: "Maintenance", value: "MAINTENANCE" },
        ]}
      >
        {(filteredBuses: any[]) => (
          <div className="glass-card overflow-hidden relative">
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
                  {filteredBuses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No vehicles found matching your search.
                      </td>
                    </tr>
                  ) : filteredBuses.map((bus: any) => (
                    <tr key={bus.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center border border-slate-700 font-bold text-slate-300">
                            {bus.numberPlate?.substring(0, 2) || "??"}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{bus.numberPlate || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{bus.model || "Unknown Model"} ({bus.year || "N/A"})</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-slate-300">{bus.capacity || 0} seats</span>
                      </td>
                      <td>
                        {bus.status === "ACTIVE" && <span className="badge badge-success">Active</span>}
                        {bus.status === "INACTIVE" && <span className="badge badge-warning">Inactive</span>}
                        {bus.status === "MAINTENANCE" && <span className="badge badge-danger">Maintenance</span>}
                        {bus.status === "OUT_OF_SERVICE" && <span className="badge bg-slate-800 text-slate-400">Archived</span>}
                        {bus.status === "IDLE" && <span className="badge badge-info">Idle</span>}
                      </td>
                      <td>
                        {bus.drivers && bus.drivers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {bus.drivers.map((d: any) => (
                              <div key={d.id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                                  {d.user?.name?.charAt(0) || "U"}
                                </div>
                                <span className="text-slate-300 text-xs">{d.user?.name || "Unknown Driver"}</span>
                              </div>
                            ))}
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
                          {bus.updatedAt ? formatDistanceToNow(new Date(bus.updatedAt), { addSuffix: true }) : "Never"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedBus(bus); setIsEditOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteBusId(bus.id)}
                            className="p-1.5 text-slate-400 hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
                          >
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
        )}
      </ClientSearchFilter>

      {/* Add / Edit Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#111827]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                {isEditOpen ? "Edit Vehicle" : "Add Vehicle"}
              </h2>
              <button disabled={isSubmitting} onClick={resetForm} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={isEditOpen ? handleEditSubmit : handleAddSubmit} className="p-6 space-y-4">
              {errorStatus && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{errorStatus}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Number Plate *</label>
                  <input required name="numberPlate" defaultValue={selectedBus?.numberPlate} placeholder="KA-01-AB-1234" className="input bg-[#111827] border-[#1e293b] w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Model</label>
                  <input name="model" defaultValue={selectedBus?.model} placeholder="Tata Starbus" className="input bg-[#111827] border-[#1e293b] w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Capacity (Seats)</label>
                  <input required type="number" name="capacity" defaultValue={selectedBus?.capacity || 52} className="input bg-[#111827] border-[#1e293b] w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Year</label>
                  <input type="number" name="year" defaultValue={selectedBus?.year || new Date().getFullYear()} className="input bg-[#111827] border-[#1e293b] w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Status *</label>
                <select name="status" defaultValue={selectedBus?.status || "ACTIVE"} className="input bg-[#111827] border-[#1e293b] w-full">
                  <option value="ACTIVE">Active</option>
                  <option value="IDLE">Idle</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Assign Driver</label>
                <select name="driverId" defaultValue={selectedBus?.drivers?.[0]?.id || ""} className="input bg-[#111827] border-[#1e293b] w-full">
                  <option value="">-- Unassigned --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.user.name} ({d.licenseNo}) {d.bus && d.bus.id !== selectedBus?.id ? '[Currently Assigned]' : ''}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">Choosing a driver currently on another bus will automatically reassign them to this one.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Assign Route</label>
                <select name="routeId" defaultValue={selectedBus?.routeId || ""} className="input bg-[#111827] border-[#1e293b] w-full">
                  <option value="">-- Unassigned --</option>
                  {availableRoutes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={isSubmitting} onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteBusId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0e1a] border border-danger/20 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
              <h3 className="text-xl font-bold text-white">Archive Vehicle?</h3>
              <p className="text-sm text-slate-400">
                This will unassign the driver and route, and move the vehicle to purely historical OUT_OF_SERVICE logs. Are you sure?
              </p>
              {errorStatus && <p className="text-xs text-danger">{errorStatus}</p>}
              
              <div className="pt-4 flex gap-3">
                <button disabled={isSubmitting} onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                <button disabled={isSubmitting} onClick={handleDeleteConfirm} className="bg-danger hover:bg-danger/80 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition flex-1">
                  {isSubmitting ? "Archiving..." : "Archive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
