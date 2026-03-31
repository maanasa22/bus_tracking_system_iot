"use server";

import { prisma } from "@/lib/prisma";

export async function triggerSOS(busId: string | null, busPlate: string | null) {
  try {
    await prisma.alert.create({
      data: {
        type: "SOS",
        severity: "CRITICAL",
        title: "Emergency SOS triggered",
        message: `SOS panic button activated by driver on ${busPlate || "unknown vehicle"}. Immediate attention required.`,
        busId: busId || undefined,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("SOS Alert creation failed:", error);
    return { success: false };
  }
}
