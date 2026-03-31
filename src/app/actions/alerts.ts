"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function acknowledgeAlert(alertId: string) {
  await prisma.alert.update({
    where: { id: alertId },
    data: { acknowledged: true },
  });
  revalidatePath("/alerts");
}

export async function acknowledgeAllAlerts() {
  await prisma.alert.updateMany({
    where: { acknowledged: false },
    data: { acknowledged: true },
  });
  revalidatePath("/alerts");
}
