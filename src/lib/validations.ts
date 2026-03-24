import { z } from "zod";

// ============================================
// Auth
// ============================================
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "DRIVER", "STUDENT"]).default("STUDENT"),
});

// ============================================
// Bus
// ============================================
export const busSchema = z.object({
  busId: z.string().min(1, "Bus ID is required"),
  numberPlate: z.string().min(1, "Number plate is required"),
  capacity: z.number().int().positive().default(52),
  model: z.string().optional(),
  year: z.number().int().optional(),
  status: z.enum(["ACTIVE", "IDLE", "DELAYED", "MAINTENANCE", "OUT_OF_SERVICE"]).default("IDLE"),
  routeId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
});

// ============================================
// Route
// ============================================
export const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  description: z.string().optional(),
  color: z.string().default("#6366f1"),
  distance: z.number().optional(),
  duration: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

// ============================================
// Stop
// ============================================
export const stopSchema = z.object({
  name: z.string().min(1, "Stop name is required"),
  lat: z.number(),
  lng: z.number(),
  order: z.number().int(),
  routeId: z.string(),
});

// ============================================
// Alert
// ============================================
export const alertSchema = z.object({
  type: z.enum(["SPEED", "GEOFENCE", "DEVICE", "ROUTE", "MAINTENANCE", "SOS"]),
  severity: z.enum(["CRITICAL", "WARNING", "INFO", "SUCCESS"]),
  title: z.string().min(1),
  message: z.string().min(1),
  busId: z.string().optional().nullable(),
});

// ============================================
// Stop Request
// ============================================
export const stopRequestSchema = z.object({
  studentId: z.string(),
  stopId: z.string(),
  studentLat: z.number(),
  studentLng: z.number(),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BusInput = z.infer<typeof busSchema>;
export type RouteInput = z.infer<typeof routeSchema>;
export type StopInput = z.infer<typeof stopSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type StopRequestInput = z.infer<typeof stopRequestSchema>;
