"use client";

import {
  Route as RouteIcon,
  Plus,
  Search,
  Map,
  Clock,
  Users,
  ArrowRight,
  X,
  AlertTriangle,
  Trash2,
  Edit2,
  GripVertical,
  MapPin,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { createRoute, updateRoute, deleteRoute } from "@/app/actions/routes";

// Dynamic import for Leaflet (no SSR)
const StopMapPicker = dynamic(() => import("./StopMapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center">
      <p className="text-slate-500 text-sm">Loading map...</p>
    </div>
  ),
});

// Predefined color palette
const COLOR_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ef4444", // Red
  "#14b8a6", // Teal
];

interface StopRow {
  id: string; // client-side unique key
  name: string;
  lat: string;
  lng: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyStop(): StopRow {
  return { id: generateId(), name: "", lat: "", lng: "" };
}

interface RoutesClientInterfaceProps {
  routes: any[];
}

export function RoutesClientInterface({ routes }: RoutesClientInterfaceProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0]);
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formStops, setFormStops] = useState<StopRow[]>([emptyStop(), emptyStop()]);

  // Active stop for map picker (which stop gets the next map click)
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);

  // Drag state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // --- Helpers ---
  const resetForm = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setDeleteRouteId(null);
    setSelectedRoute(null);
    setErrorStatus(null);
    setIsSubmitting(false);
    setFormName("");
    setFormDescription("");
    setFormColor(COLOR_PALETTE[0]);
    setFormStatus("ACTIVE");
    setFormStops([emptyStop(), emptyStop()]);
    setActiveStopIndex(null);
  };

  const openEditModal = (route: any) => {
    setSelectedRoute(route);
    setFormName(route.name);
    setFormDescription(route.description || "");
    setFormColor(route.color || COLOR_PALETTE[0]);
    setFormStatus(route.status);
    setFormStops(
      route.stops.map((s: any) => ({
        id: generateId(),
        name: s.name,
        lat: String(s.lat),
        lng: String(s.lng),
      }))
    );
    setIsEditOpen(true);
  };

  // --- Stop management ---
  const addStop = () => {
    setFormStops((prev) => [...prev, emptyStop()]);
  };

  const removeStop = (index: number) => {
    if (formStops.length <= 2) return; // minimum 2 stops
    setFormStops((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: keyof StopRow, value: string) => {
    setFormStops((prev) =>
      prev.map((stop, i) => (i === index ? { ...stop, [field]: value } : stop))
    );
  };

  const moveStop = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formStops.length) return;
    const updated = [...formStops];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFormStops(updated);
  };

  // Drag handlers
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      moveStop(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // --- Submit ---
  const handleSubmit = async (mode: "create" | "edit") => {
    setIsSubmitting(true);
    setErrorStatus(null);

    // Validate stops
    const validStops = formStops.filter((s) => s.name.trim() && s.lat && s.lng);
    if (validStops.length < 2) {
      setErrorStatus("Please add at least 2 stops with name, latitude, and longitude.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formName,
      description: formDescription,
      color: formColor,
      status: formStatus,
      stops: validStops.map((s) => ({
        name: s.name,
        lat: parseFloat(s.lat),
        lng: parseFloat(s.lng),
      })),
    };

    // Check for NaN coordinates
    if (payload.stops.some((s) => isNaN(s.lat) || isNaN(s.lng))) {
      setErrorStatus("All stop coordinates must be valid numbers.");
      setIsSubmitting(false);
      return;
    }

    const res =
      mode === "create"
        ? await createRoute(payload)
        : await updateRoute(selectedRoute.id, payload);

    if (res.error) {
      setErrorStatus(res.error);
      setIsSubmitting(false);
    } else {
      resetForm();
      router.refresh(); // Force client cache clear
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRouteId) return;
    setIsSubmitting(true);
    setErrorStatus(null);
    const res = await deleteRoute(deleteRouteId);
    if (res.error) {
      setErrorStatus(res.error);
      setIsSubmitting(false);
    } else {
      resetForm();
      router.refresh();
    }
  };

  // --- Search filter ---
  const filteredRoutes = routes.filter((route) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (route.name.toLowerCase().includes(q)) return true;
    if (route.description?.toLowerCase().includes(q)) return true;
    if (route.stops?.some((s: any) => s.name.toLowerCase().includes(q))) return true;
    return false;
  });

  // =====================
  // RENDER
  // =====================
  return (
    <div className="space-y-6 animate-fade-in pl-4 pr-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <RouteIcon className="h-7 w-7 text-secondary" />
            Route Management
          </h1>
          <p className="text-muted-foreground">Configure transit paths, stop sequences, and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/map" className="btn-ghost bg-[#111827]">
            <Map className="h-4 w-4" />
            View on Map
          </Link>
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Route
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search routes by name or stop..."
            className="input pl-10 bg-[#111827] border-[#1e293b]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoutes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {searchQuery ? "No routes match your search." : "No routes created yet. Click \"Create Route\" to get started."}
          </div>
        ) : (
          filteredRoutes.map((route: any) => {
            const firstStop = route.stops[0];
            const lastStop = route.stops[route.stops.length - 1];
            const activeSchedule = route.schedules?.[0];
            const routeStudents = route.stops.flatMap((stop: any) => stop.students || []);

            return (
              <div key={route.id} className="glass-card p-6 flex flex-col group relative overflow-hidden">
                {/* Card Background */}
                <div className="absolute -right-10 -top-10 text-secondary/5 group-hover:text-secondary/10 transition-colors pointer-events-none">
                  <RouteIcon className="w-40 h-40" />
                </div>

                {/* Route color indicator */}
                <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: route.color || "#6366f1" }} />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{route.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeSchedule ? `${activeSchedule.startTime} - ${activeSchedule.endTime}` : "No active schedule"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          route.status === "ACTIVE"
                            ? "text-success bg-success/10"
                            : route.status === "SUSPENDED"
                            ? "text-warning bg-warning/10"
                            : "text-slate-400 bg-slate-700"
                        }`}
                      >
                        {route.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col items-center justify-center bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 min-w-[60px]">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Buses</span>
                      <span className="text-lg font-bold text-white leading-none">{route.buses?.length || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 min-w-[60px]">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Pax</span>
                      <span className="text-lg font-bold text-white leading-none">{routeStudents.length}</span>
                    </div>
                  </div>
                </div>

                {/* Path visualization */}
                <div className="bg-[#0c1222] border border-[#1e293b] rounded-xl p-4 mb-6 flex-1 relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Origin</p>
                      <p className="font-medium text-slate-200 line-clamp-1">{firstStop?.name || "Unknown"}</p>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <span className="text-[10px] text-muted-foreground font-medium bg-[#1e293b] px-2 py-0.5 rounded-full mb-1">
                        {route.stops.length} Stops
                      </span>
                      <div className="flex items-center" style={{ color: route.color || "#10b981" }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color || "#10b981" }} />
                        <div className="w-12 h-[2px] border-t border-dashed" style={{ borderColor: route.color || "#10b981" }} />
                        <ArrowRight className="w-4 h-4 ml-[-4px]" />
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Destination</p>
                      <p className="font-medium text-slate-200 line-clamp-1">{lastStop?.name || "Unknown"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#1e293b] pt-4 mt-auto relative z-10">
                  <div className="flex -space-x-2">
                    {routeStudents.slice(0, 4).map((_: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-[#111827] flex items-center justify-center text-[10px] font-bold text-white">
                        SD
                      </div>
                    ))}
                    {routeStudents.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-[#1e293b] border-2 border-[#111827] flex items-center justify-center text-[10px] font-bold text-slate-300">
                        +{routeStudents.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(route)}
                      className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                      title="Edit Route"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteRouteId(route.id)}
                      className="p-1.5 text-slate-400 hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
                      title="Delete Route"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================================= */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#111827] shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-secondary" />
                {isEditOpen ? "Edit Route" : "Create Route"}
              </h2>
              <button disabled={isSubmitting} onClick={resetForm} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body — Scrollable */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {errorStatus && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{errorStatus}</p>
                </div>
              )}

              {/* Route Name & Description */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Route Name *</label>
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Route 6 - Electronic City"
                    className="input bg-[#111827] border-[#1e293b] w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Description</label>
                  <input
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Electronic City to JGI"
                    className="input bg-[#111827] border-[#1e293b] w-full"
                  />
                </div>
              </div>

              {/* Color & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Route Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          formColor === color ? "border-white scale-110 shadow-lg" : "border-transparent hover:border-slate-500"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="input bg-[#111827] border-[#1e293b] w-full"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Map Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" />
                    Map Picker
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {activeStopIndex !== null
                      ? `Click map to set coords for Stop #${activeStopIndex + 1}`
                      : "Select a stop row below, then click on the map"}
                  </span>
                </div>
                <StopMapPicker
                  stops={formStops.map((s, i) => ({
                    index: i,
                    name: s.name,
                    lat: parseFloat(s.lat) || 0,
                    lng: parseFloat(s.lng) || 0,
                  }))}
                  activeStopIndex={activeStopIndex}
                  onMapClick={(lat, lng) => {
                    // If a stop row is selected, fill that row; otherwise fill the first empty one
                    let targetIndex = activeStopIndex;
                    if (targetIndex === null) {
                      targetIndex = formStops.findIndex((s) => !s.lat || !s.lng);
                    }
                    if (targetIndex === null || targetIndex === -1) return;
                    setFormStops((prev) =>
                      prev.map((stop, i) =>
                        i === targetIndex
                          ? { ...stop, lat: lat.toFixed(4), lng: lng.toFixed(4) }
                          : stop
                      )
                    );
                    // Auto-advance to next empty stop
                    const nextEmpty = formStops.findIndex(
                      (s, i) => i > targetIndex! && (!s.lat || !s.lng)
                    );
                    setActiveStopIndex(nextEmpty !== -1 ? nextEmpty : null);
                  }}
                  routeColor={formColor}
                />
              </div>

              {/* Dynamic Stop Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Stops ({formStops.length})
                  </label>
                  <button
                    type="button"
                    onClick={addStop}
                    className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Stop
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {formStops.map((stop, index) => (
                    <div
                      key={stop.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => setActiveStopIndex(index)}
                      className={`flex items-center gap-2 bg-[#111827] border rounded-lg p-2.5 group/stop cursor-move transition-colors ${
                        activeStopIndex === index ? "border-primary/60 bg-primary/5" : "border-[#1e293b] hover:border-primary/30"
                      }`}
                    >
                      {/* Drag handle */}
                      <div className="flex flex-col items-center shrink-0 text-slate-600 group-hover/stop:text-slate-400 transition-colors">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-[9px] font-bold text-slate-500 mt-0.5">{index + 1}</span>
                      </div>

                      {/* Stop name */}
                      <input
                        value={stop.name}
                        onChange={(e) => updateStop(index, "name", e.target.value)}
                        placeholder="Stop name"
                        className="input bg-[#0a0e1a] border-[#1e293b] flex-1 text-sm h-8"
                      />

                      {/* Lat */}
                      <input
                        value={stop.lat}
                        onChange={(e) => updateStop(index, "lat", e.target.value)}
                        placeholder="Lat"
                        type="number"
                        step="any"
                        className="input bg-[#0a0e1a] border-[#1e293b] w-24 text-sm h-8"
                      />

                      {/* Lng */}
                      <input
                        value={stop.lng}
                        onChange={(e) => updateStop(index, "lng", e.target.value)}
                        placeholder="Lng"
                        type="number"
                        step="any"
                        className="input bg-[#0a0e1a] border-[#1e293b] w-24 text-sm h-8"
                      />

                      {/* Up/Down arrows for mobile */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveStop(index, index - 1)}
                          disabled={index === 0}
                          className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStop(index, index + 1)}
                          disabled={index === formStops.length - 1}
                          className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        disabled={formStops.length <= 2}
                        className="p-1 text-slate-500 hover:text-danger disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">Click a stop row to select it, then click the map to set coordinates. Drag to reorder. Min 2 stops.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1e293b] bg-[#111827] flex justify-end gap-3 shrink-0">
              <button type="button" disabled={isSubmitting} onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(isEditOpen ? "edit" : "create")}
                className="btn-primary"
              >
                {isSubmitting ? "Saving..." : isEditOpen ? "Update Route" : "Create Route"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================= */}
      {deleteRouteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0e1a] border border-danger/20 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-8 w-8 text-danger" />
              </div>
              <h3 className="text-xl font-bold text-white">Delete Route?</h3>
              <p className="text-sm text-slate-400">
                This will unassign all buses from the route, remove all stops, schedules, and trip history. This action cannot be undone.
              </p>
              {errorStatus && <p className="text-xs text-danger">{errorStatus}</p>}

              <div className="pt-4 flex gap-3">
                <button disabled={isSubmitting} onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleDeleteConfirm}
                  className="bg-danger hover:bg-danger/80 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition flex-1"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
