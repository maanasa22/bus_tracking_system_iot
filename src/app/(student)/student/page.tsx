import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MapPin, Navigation, Clock, AlertTriangle, Bus } from "lucide-react";
import { redirect } from "next/navigation";
import { DynamicStudentMap } from "./StudentMapWrapper.client";

export default async function StudentDashboard() {
  const session = await auth();

  // Fetch student data and assigned stop
  let studentData;
  if (session?.user.role === 'STUDENT') {
    studentData = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        assignedStop: {
          include: {
            route: {
              include: { buses: true }
            }
          }
        }
      }
    });
  } else {
    // For SUPERADMIN demo access
    studentData = await prisma.student.findFirst({
      include: {
        user: true,
        assignedStop: {
          include: {
            route: {
              include: { buses: true }
            }
          }
        }
      }
    });
  }

  const stop = studentData?.assignedStop;
  const route = stop?.route;
  const assignedBus = route?.buses?.[0];

  const targetBusId = assignedBus?.busId;
  const targetPlate = assignedBus?.numberPlate;
  const targetStopLat = stop?.lat;
  const targetStopLng = stop?.lng;
  const targetStopName = stop?.name;
  const studentFirstName = studentData?.user?.name?.split(' ')[0] || 'Student';
  const routeName = stop?.route?.name || 'school';

  return (
    <div className="flex-1 flex flex-col relative bg-[#0a0e1a]">
      {/* Search Header */}
      <div className="z-10 bg-[#0f172a] p-5 rounded-b-3xl shadow-md border-b border-slate-800 relative">
         <div className="flex justify-between items-center mb-1">
            <div>
               <h1 className="text-xl font-bold text-white">Good morning, {studentFirstName}!</h1>
               <p className="text-sm text-slate-400 mt-1">Track your ride to {routeName}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
               {studentData?.user?.name?.charAt(0) || 'S'}
            </div>
         </div>
      </div>

      {/* Real-time Interactive Map */}
      {targetStopLat !== undefined && targetStopLng !== undefined && targetBusId ? (
        <DynamicStudentMap 
          busId={targetBusId}
          stopLat={targetStopLat}
          stopLng={targetStopLng}
          stopName={targetStopName!}
          assignedBusPlate={targetPlate!}
        />
      ) : (
        <div className="flex-1 min-h-[40vh] bg-[#0a0e1a] flex items-center justify-center text-slate-500">
           No active tracking data available.
        </div>
      )}

      {/* Bottom Information Pull-Up */}
      <div className="bg-[#0f172a] border-t border-slate-800 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 pb-16">
         <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto my-3 mt-4"></div>
         
         {route ? (
           <div className="p-5 pt-2">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Live Status</span>
                    <h2 className="text-3xl font-black text-white">On Time</h2>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Arrival in</span>
                    <div className="flex items-end gap-1 justify-end text-primary">
                       <h2 className="text-3xl font-black leading-none text-primary">8</h2>
                       <span className="font-bold pb-0.5 text-primary">mins</span>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-5 shadow-inner">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                       <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-slate-200">Approaching Stop</p>
                       <p className="text-xs text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-success" /> 1.2km away
                       </p>
                    </div>
                 </div>

                 <div className="h-px w-full bg-slate-700/50 my-3"></div>

                 <div className="flex justify-between items-center px-1">
                    <p className="text-xs font-medium text-slate-400">Pick-up Location</p>
                    <p className="text-sm font-bold text-slate-200">{stop.name}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-700 transition-colors shadow-sm text-sm">
                   Share Location
                 </button>
                 <button className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold px-5 py-3.5 rounded-xl hover:bg-amber-500/20 transition-colors flex items-center gap-2 shadow-sm text-sm">
                   <AlertTriangle className="h-4 w-4" /> Issue?
                 </button>
              </div>
           </div>
         ) : (
           <div className="p-8 text-center text-slate-500">
              <MapPin className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="font-medium text-slate-300 mb-1">No Active Assignment</p>
              <p className="text-sm">You do not currently have a registered stop or route assigned.</p>
           </div>
         )}
      </div>
    </div>
  );
}

// Ensure the helper CheckCircle2 is defined if it wasn't exported from lucide-react above
function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
