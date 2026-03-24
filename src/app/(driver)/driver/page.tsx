import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MapPin, Navigation, Power, ShieldAlert, Phone, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DriverDashboard() {
  const session = await auth();
  
  // Get driver data and assigned active schedule
  let driverData;
  if (session?.user.role === 'DRIVER') {
    driverData = await prisma.driver.findUnique({
      where: { userId: session.user.id }
    });
  } else {
    // For SUPERADMIN viewing the driver portal, grab the first driver for demo purposes
    driverData = await prisma.driver.findFirst();
  }

  let activeSchedule = null;
  if (driverData) {
    activeSchedule = await prisma.schedule.findFirst({
      where: { driverId: driverData.id },
      include: {
        route: {
          include: {
            stops: { orderBy: { order: "asc" } },
            buses: true
          }
        }
      }
    });
  }

  const route = activeSchedule?.route;
  const assignedBus = route?.buses?.[0];

  return (
    <div className="flex-1 flex flex-col bg-[#050812]">
      {/* Route & Vehicle Sticky Header */}
      <div className="bg-[#0c1222] p-4 border-b border-[#1e293b] shadow-xl space-y-3 z-10">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#64748b] mb-1 block">Active Assignment</span>
            <h1 className="text-xl font-bold text-white leading-none">
              {route ? route.name : "Unassigned"}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-[#64748b] mb-1 block">Vehicle</span>
            <div className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-bold text-sm inline-block">
              {assignedBus ? assignedBus.numberPlate : "N/A"}
            </div>
          </div>
        </div>
        
        {activeSchedule && (
           <div className="flex items-center justify-between bg-[#111827] rounded-lg p-3">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
               <span className="text-sm font-semibold text-slate-300">Shift Started</span>
             </div>
             <div className="text-sm font-bold font-mono text-white">
               {activeSchedule.startTime} - {activeSchedule.endTime}
             </div>
           </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {route ? (
          <>
            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <Link href="/driver/route" className="glass-card bg-primary text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                <Navigation className="h-8 w-8" />
                <span className="font-bold">Start Route</span>
              </Link>
              <button className="glass-card bg-[#1e293b] hover:bg-[#273248] text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-danger">
                <ShieldAlert className="h-8 w-8" />
                <span className="font-bold">SOS Panic</span>
              </button>
            </div>

            {/* Next Stops Summary */}
            <div className="glass-card p-4 rounded-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#1e293b]"></div>
               <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                 <MapPin className="h-4 w-4 text-info" />
                 Upcoming Stops
               </h3>
               
               <div className="space-y-6 ml-3 relative">
                 <div className="absolute top-2 left-[-16px] bottom-2 w-px bg-[#1e293b]"></div>
                 
                 {route.stops.slice(0, 3).map((stop: any, i: number) => (
                   <div key={stop.id} className="relative">
                     {/* Point indicator */}
                     <div className={`absolute top-1 left-[-20.5px] w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-info shadow-[0_0_10px_theme(colors.info)]' : 'bg-[#334155]'}`}></div>
                     
                     <div className="flex justify-between items-start">
                       <div>
                         <h4 className={`font-bold ${i === 0 ? 'text-white' : 'text-slate-400'}`}>{stop.name}</h4>
                         <p className="text-xs text-muted-foreground mt-0.5">Estimated: {15 * (i+1)} mins</p>
                       </div>
                       {i === 0 && (
                         <div className="flex items-center gap-1.5 bg-[#111827] px-2 py-1 rounded-md border border-[#1e293b]">
                           <Users className="h-3 w-3 text-secondary" />
                           <span className="text-xs font-bold text-slate-300">Wait: 4</span>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
               
               <button className="w-full mt-5 py-2 text-sm text-slate-400 font-medium hover:text-white transition-colors bg-[#0c1222] rounded-md">
                 View Full Itinerary ({route.stops.length} stops)
               </button>
            </div>
            
            {/* Quick Contacts */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
               <button className="flex items-center justify-center gap-2 p-3 rounded-lg border border-[#1e293b] text-slate-400 hover:text-white hover:bg-[#111827] transition-colors text-sm font-semibold">
                 <Phone className="h-4 w-4" /> Dispatch
               </button>
               <button className="flex items-center justify-center gap-2 p-3 rounded-lg border border-[#1e293b] text-slate-400 hover:text-white hover:bg-[#111827] transition-colors text-sm font-semibold text-warning">
                 <Power className="h-4 w-4" /> End Shift
               </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#1e293b] rounded-xl m-4">
             <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center mb-4">
               <Navigation className="h-8 w-8 text-slate-600" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">No Active Assigned Route</h2>
             <p className="text-slate-400 text-sm">You do not have a schedule presently active. Please contact the dispatch center if you believe this is an error.</p>
          </div>
        )}
      </div>
    </div>
  );
}
