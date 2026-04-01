"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBus(data: {
  numberPlate: string;
  model: string;
  year: number;
  capacity: number;
  status: string;
  driverId: string | null;
  routeId: string | null;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized access" };
    }

    // Assigning driver: if a driver is picked, ensure they aren't on another bus, or steal them
    if (data.driverId) {
      await prisma.bus.updateMany({
        where: { driverId: data.driverId },
        data: { driverId: null }
      });
    }

    // generate a generic unique BUS-XXX ID
    const count = await prisma.bus.count();
    const newBusId = `BUS-${(count + 1).toString().padStart(3, '0')}`;

    await prisma.bus.create({
      data: {
        busId: newBusId,
        numberPlate: data.numberPlate,
        model: data.model,
        year: data.year,
        capacity: data.capacity,
        status: data.status,
        driverId: data.driverId,
        routeId: data.routeId,
      }
    });

    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "A vehicle with this Number Plate already exists." };
    }
    return { error: error.message || "Failed to create vehicle" };
  }
}

export async function updateBus(busId: string, data: {
  numberPlate: string;
  model: string;
  year: number;
  capacity: number;
  status: string;
  driverId: string | null;
  routeId: string | null;
}) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized access" };
    }

    // Driver Steal Logic: If the selected driverId is different from the bus's current Driver,
    // we need to nullify the old bus holding this driver because Prisma 1:1 constraint will throw.
    if (data.driverId) {
      // Find what bus currently has this driver, if any
      const existingBusWithDriver = await prisma.bus.findFirst({
        where: { driverId: data.driverId }
      });

      if (existingBusWithDriver && existingBusWithDriver.id !== busId) {
        // Strip the driver from the other bus
        await prisma.bus.update({
          where: { id: existingBusWithDriver.id },
          data: { driverId: null }
        });
      }
    }

    await prisma.bus.update({
      where: { id: busId },
      data: {
        numberPlate: data.numberPlate,
        model: data.model,
        year: data.year,
        capacity: data.capacity,
        status: data.status,
        driverId: data.driverId,
        routeId: data.routeId
      }
    });

    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "A vehicle with this Number Plate already exists." };
    }
    return { error: error.message || "Failed to update vehicle" };
  }
}

export async function archiveBus(busId: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
      return { error: "Unauthorized access" };
    }

    await prisma.bus.update({
      where: { id: busId },
      data: { 
        status: "OUT_OF_SERVICE",
        driverId: null, // Safely unassign driver so they can be reused
        routeId: null // Safely unassign route
      }
    });

    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to archive vehicle" };
  }
}
