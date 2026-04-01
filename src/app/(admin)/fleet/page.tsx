export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Bus, Plus, Search, Filter, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ClientSearchFilter } from "@/components/ClientSearchFilter";
import { FleetClientInterface } from "./FleetClientInterface";

export default async function FleetPage() {
  try {
    const rawBuses = await prisma.bus.findMany({
      include: {
        drivers: {
          include: { user: true }
        },
        device: true,
        route: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const rawDrivers = await prisma.driver.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } }
    });

    const rawRoutes = await prisma.route.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" }
    });

    const replacer = (k: string, v: any) => typeof v === 'bigint' ? v.toString() : v;
    const buses = JSON.parse(JSON.stringify(rawBuses, replacer));
    const availableDrivers = JSON.parse(JSON.stringify(rawDrivers, replacer));
    const availableRoutes = JSON.parse(JSON.stringify(rawRoutes, replacer));

    return <FleetClientInterface buses={buses} availableDrivers={availableDrivers} availableRoutes={availableRoutes} />;
  } catch (error: any) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl text-red-500 font-bold">Fleet Page Debug Error</h1>
        <pre className="bg-black text-red-300 p-4 rounded-lg overflow-auto">
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
      </div>
    )
  }
}
