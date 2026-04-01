export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { DynamicLiveMap } from "@/components/map/MapWrapper.client";

export default async function MapPage() {
  // Fetch required data server-side
  const [rawBuses, rawRoutes] = await Promise.all([
    prisma.bus.findMany({
      include: {
        device: true,
        route: { select: { id: true, name: true, color: true } }
      }
    }),
    prisma.route.findMany({
      include: {
        stops: { orderBy: { order: "asc" } }
      }
    })
  ]);

  // CRITICAL: Convert to plain JSON to strip any hidden BigInt/Date properties
  // that cause "Do not know how to serialize a BigInt" crashes in React Flight
  // We MUST provide a BigInt replacer because the SQLite driver maps Int to BigInt
  const replacer = (k: string, v: any) => typeof v === 'bigint' ? v.toString() : v;
  const buses = JSON.parse(JSON.stringify(rawBuses, replacer));
  const routes = JSON.parse(JSON.stringify(rawRoutes, replacer));

  return (
    <div className="animate-fade-in pl-4 pr-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Global Command Center</h1>
          <p className="text-muted-foreground">Real-time GPS tracking and route adherence visualization.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </div>
            <span className="text-sm font-medium text-slate-300">Live Feed Active</span>
          </div>
        </div>
      </div>

      <DynamicLiveMap initialBuses={buses} routes={routes} />
    </div>
  );
}
