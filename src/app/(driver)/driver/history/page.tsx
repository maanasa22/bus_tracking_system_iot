import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Calendar, Clock, Map, Users, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DriverTripHistoryPage() {
  const session = await auth();
  
  // Find driver ID from session
  let driverData;
  if (session?.user.role === 'DRIVER') {
    driverData = await prisma.driver.findUnique({
      where: { userId: session.user.id }
    });
  } else {
    // For SUPERADMIN viewing the driver portal, grab the first driver for demo
    driverData = await prisma.driver.findFirst();
  }

  // Get trips for the bus assigned to this driver
  const trips = await prisma.trip.findMany({
    where: { 
      bus: { 
        driverId: driverData?.id 
      } 
    },
    include: {
      route: true,
      bus: { select: { numberPlate: true } }
    },
    orderBy: { startTime: "desc" },
    take: 50 // Last 50 trips
  });

  return (
    <div className="flex-1 flex flex-col bg-[#050812]">
      {/* Header */}
      <div className="bg-[#0c1222] p-4 border-b border-[#1e293b] flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <Link href="/driver" className="p-2 rounded-lg bg-[#111827] text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Trip History</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Your Recent Activity</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {trips.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#1e293b] rounded-xl glass-card">
            <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No History Found</h2>
            <p className="text-slate-400 text-sm">You haven't completed any tracked trips yet. Once you complete routes, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="glass-card p-4 rounded-xl border border-[#1e293b]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{trip.route.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(trip.startTime), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    trip.status === "COMPLETED" ? "bg-success/10 text-success" :
                    trip.status === "IN_PROGRESS" ? "bg-primary/10 text-primary animate-pulse" :
                    "bg-danger/10 text-danger"
                  }`}>
                    {trip.status.replace("_", " ")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-[#0c1222] p-2.5 rounded-lg border border-[#1e293b] flex items-center gap-2">
                    <Users className="w-4 h-4 text-info" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Passengers</p>
                      <p className="font-bold text-slate-200 text-sm">{trip.passengers}</p>
                    </div>
                  </div>
                  <div className="bg-[#0c1222] p-2.5 rounded-lg border border-[#1e293b] flex items-center gap-2">
                    <Map className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 leading-none mb-1">Distance</p>
                      <p className="font-bold text-slate-200 text-sm">{trip.distance ? `${trip.distance.toFixed(1)} km` : "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#1e293b]">
                  <span className="font-mono text-slate-500 bg-[#0a0e1a] px-2 py-0.5 rounded border border-[#1e293b]">
                    {trip.bus.numberPlate}
                  </span>
                  
                  {trip.status === "COMPLETED" && (
                    <div className="flex items-center gap-1.5 font-bold">
                      {trip.onTime ? (
                        <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> On Time</span>
                      ) : (
                        <span className="text-warning flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Delayed</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
