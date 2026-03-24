import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MapPin, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DynamicDriverMap } from "./DriverMapWrapper.client";

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

  if (!activeSchedule?.route) {
    redirect("/driver");
  }

  const route = activeSchedule.route;
  const nextStopName = route.stops[0]?.name ?? "Unknown";
  const targetBusId = route.buses.length > 0 ? route.buses[0].busId : null;
  const routeColor = route.color || "#6366f1";

  // Serialize stops to plain objects (strips BigInt/Date from Prisma)
  // We MUST provide a BigInt replacer because the SQLite driver maps Int to BigInt
  const plainStops = JSON.parse(JSON.stringify(route.stops, (k, v) => 
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

      {/* Top HUD */}
      <div className="z-[1000] p-4 sticky top-0 bg-gradient-to-b from-[#0c1222]/90 to-transparent flex justify-between items-start">
        <Link href="/driver" className="w-10 h-10 rounded-full bg-[#111827] border border-[#1e293b] flex items-center justify-center text-slate-300 shadow-xl backdrop-blur-md">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <button className="bg-danger text-white rounded-full px-4 py-2 font-bold text-sm shadow-xl flex items-center gap-2 animate-pulse">
           <ShieldAlert className="h-4 w-4" /> SOS
        </button>
      </div>

      {/* Bottom Control Panel */}
      <div className="z-[1000] mt-auto bg-[#0c1222]/95 backdrop-blur-xl border-t border-[#1e293b] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-12 h-1.5 bg-[#1e293b] rounded-full mx-auto my-3"></div>
        
        <div className="px-5 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
               <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Next Stop</p>
               <h2 className="text-2xl font-bold text-white">{nextStopName}</h2>
            </div>
            <div className="text-right">
               <h2 className="text-3xl font-black text-white">12<span className="text-lg text-slate-400 font-bold ml-1">min</span></h2>
               <p className="text-sm text-muted-foreground font-medium">3.2 km away</p>
            </div>
          </div>

          <div className="flex bg-[#111827] rounded-xl p-3 border border-[#1e293b] justify-between items-center mb-5">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                 <MapPin className="h-5 w-5 text-success" />
               </div>
               <div>
                  <p className="font-bold text-slate-200">2 Students Waiting</p>
                  <p className="text-xs text-muted-foreground">Please ensure safe boarding</p>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button className="bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform flex justify-center items-center gap-2">
               <CheckCircle2 className="h-5 w-5" /> Arrived
             </button>
             <button className="bg-[#1e293b] text-white font-bold py-4 rounded-xl active:scale-95 transition-transform">
               Skip Stop
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
