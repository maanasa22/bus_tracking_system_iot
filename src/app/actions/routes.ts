"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface StopInput {
  name: string;
  lat: number;
  lng: number;
}

export async function createRoute(data: {
  name: string;
  description: string;
  color: string;
  status: string;
  stops: StopInput[];
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized access" };
    }

    if (!data.name.trim()) {
      return { error: "Route name is required." };
    }
    if (data.stops.length < 2) {
      return { error: "A route must have at least 2 stops." };
    }

    const route = await prisma.route.create({
      data: {
        name: data.name.trim(),
        description: data.description.trim() || null,
        color: data.color || "#6366f1",
        status: data.status || "ACTIVE",
        distance: data.stops.length * 3.5,
        duration: data.stops.length * 5,
        stops: {
          create: data.stops.map((stop, index) => ({
            name: stop.name.trim(),
            lat: stop.lat,
            lng: stop.lng,
            order: index + 1,
          })),
        },
      },
    });

    revalidatePath("/routes");
    revalidatePath("/fleet");
    revalidatePath("/map");
    return { success: true, routeId: route.id };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "A route with this name already exists." };
    }
    return { error: error.message || "Failed to create route" };
  }
}

export async function updateRoute(
  routeId: string,
  data: {
    name: string;
    description: string;
    color: string;
    status: string;
    stops: StopInput[];
  }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized access" };
    }

    if (!data.name.trim()) {
      return { error: "Route name is required." };
    }
    if (data.stops.length < 2) {
      return { error: "A route must have at least 2 stops." };
    }

    // Delete existing stops — they will be re-created with new order
    await prisma.stop.deleteMany({ where: { routeId } });

    // Update route metadata and create new stops
    await prisma.route.update({
      where: { id: routeId },
      data: {
        name: data.name.trim(),
        description: data.description.trim() || null,
        color: data.color || "#6366f1",
        status: data.status,
        distance: data.stops.length * 3.5,
        duration: data.stops.length * 5,
        stops: {
          create: data.stops.map((stop, index) => ({
            name: stop.name.trim(),
            lat: stop.lat,
            lng: stop.lng,
            order: index + 1,
          })),
        },
      },
    });

    revalidatePath("/routes");
    revalidatePath("/fleet");
    revalidatePath("/map");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update route" };
  }
}

export async function deleteRoute(routeId: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized access" };
    }

    // 1. Unlink all buses from this route
    await prisma.bus.updateMany({
      where: { routeId },
      data: { routeId: null, status: "IDLE" },
    });

    // 2. Unlink students from stops on this route
    const stopsOnRoute = await prisma.stop.findMany({
      where: { routeId },
      select: { id: true },
    });
    const stopIds = stopsOnRoute.map((s) => s.id);
    if (stopIds.length > 0) {
      await prisma.student.updateMany({
        where: { stopId: { in: stopIds } },
        data: { stopId: null },
      });
      await prisma.stopRequest.deleteMany({
        where: { stopId: { in: stopIds } },
      });
    }

    // 3. Delete schedules and trips for this route
    await prisma.schedule.deleteMany({ where: { routeId } });
    await prisma.trip.deleteMany({ where: { routeId } });

    // 4. Delete stops
    await prisma.stop.deleteMany({ where: { routeId } });

    // 5. Delete the route itself
    await prisma.route.delete({ where: { id: routeId } });

    revalidatePath("/routes");
    revalidatePath("/fleet");
    revalidatePath("/map");
    revalidatePath("/drivers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete route" };
  }
}
