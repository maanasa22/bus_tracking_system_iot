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

    // generate a generic unique BUS-XXX ID
    const count = await prisma.bus.count();
    const newBusId = `BUS-${(count + 1).toString().padStart(3, '0')}`;

    const bus = await prisma.bus.create({
      data: {
        busId: newBusId,
        numberPlate: data.numberPlate,
        model: data.model,
        year: data.year,
        capacity: data.capacity,
        status: data.status,
        routeId: data.routeId,
      }
    });

    // Assign the driver if provided
    if (data.driverId) {
      await prisma.driver.update({
        where: { id: data.driverId },
        data: { busId: bus.id }
      });
    }

    revalidatePath("/fleet");
    revalidatePath("/drivers");
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

    await prisma.bus.update({
      where: { id: busId },
      data: {
        numberPlate: data.numberPlate,
        model: data.model,
        year: data.year,
        capacity: data.capacity,
        status: data.status,
        routeId: data.routeId
      }
    });

    // Handle driver reassignment (1:N logic)
    if (data.driverId) {
      await prisma.driver.update({
        where: { id: data.driverId },
        data: { busId: busId }
      });
    }

    revalidatePath("/fleet");
    revalidatePath("/drivers");
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

    // Disconnect all drivers from this bus
    await prisma.driver.updateMany({
      where: { busId: busId },
      data: { busId: null }
    });

    await prisma.bus.update({
      where: { id: busId },
      data: { 
        status: "OUT_OF_SERVICE",
        routeId: null
      }
    });

    revalidatePath("/fleet");
    revalidatePath("/drivers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to archive vehicle" };
  }
}
