import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DynamicDriverMap } from "./DriverMapWrapper.client";
import RouteProgressPanel from "./RouteProgressPanel";

export default async function DriverLiveRoute() {
  const session = await auth();
  
  let driverData;
  if (session?.user.role === 'DRIVER') {
    driverData = await prisma.driver.findUnique({ where: { userId: session.user.id } });
  } else {
    driverData = await prisma.driver.findFirst();
  }

  const activeSchedule = driverData ? await prisma.schedule.findFirst({
    where: { driverId: driverData.id },
    include: {
      route: {
        include: { stops: { orderBy: { order: "asc" } }, buses: true }
      }
    }
  }) : null;

  const assignedBus = driverData?.busId ? await prisma.bus.findUnique({
    where: { id: driverData.busId },
    include: { route: { include: { stops: { orderBy: { order: "asc" } } } } }
  }) : null;

  if (!assignedBus?.route) {
    redirect("/driver");
  }

  const route = assignedBus.route;
  const targetBusId = assignedBus.busId;
  const targetBusDbId = assignedBus.id;
  const targetBusPlate = assignedBus.numberPlate;
  const routeColor = route.color || "#6366f1";

  // Get real student counts for each stop
  const stopsWithCounts = await Promise.all(
    route.stops.map(async (stop) => {
      const count = await prisma.student.count({ where: { stopId: stop.id } });
      return {
        id: stop.id,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        order: stop.order,
        studentCount: count,
      };
    })
  );

  // Serialize stops to plain objects (BigInt safe)
  const plainStops = JSON.parse(JSON.stringify(stopsWithCounts, (k, v) => 
    typeof v === 'bigint' ? v.toString() : v
  ));

  return (
    <div className="flex-1 flex flex-col relative bg-[#050812]">
      {/* Real Leaflet Map Background */}
      {targetBusId ? (
        <DynamicDriverMap busId={targetBusId} stops={plainStops} routeColor={routeColor} />
      ) : (
        <div className="absolute inset-0 bg-[#0a0e1a] z-0 flex items-center justify-center">
          <p className="text-slate-500">No bus assigned</p>
        </div>
      )}

      {/* Interactive Progress Panel (replaces old hardcoded HUD) */}
      <RouteProgressPanel
        stops={plainStops}
        routeDuration={route.duration || 60}
        routeDistance={route.distance || 15}
        busId={targetBusDbId}
        busPlate={targetBusPlate}
      />
    </div>
  );
}
