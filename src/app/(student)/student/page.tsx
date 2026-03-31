import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MapPin, Navigation } from "lucide-react";
import { DynamicStudentMap } from "./StudentMapWrapper.client";
import StudentInfoPanel from "./StudentInfoPanel";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
  const targetPlate = assignedBus?.numberPlate ?? "N/A";
  const targetStopLat = stop?.lat;
  const targetStopLng = stop?.lng;
  const targetStopName = stop?.name ?? "Unknown";
  const studentFirstName = studentData?.user?.name?.split(' ')[0] || 'Student';
  const routeName = route?.name || 'school';
  const routeDuration = route?.duration || 60;

  return (
    <div className="flex-1 flex flex-col relative bg-[#0a0e1a]">
      {/* Search Header */}
      <div className="z-10 bg-[#0f172a] p-5 rounded-b-3xl shadow-md border-b border-slate-800 relative">
         <div className="flex justify-between items-center mb-1">
            <div>
               <h1 className="text-xl font-bold text-white">{getGreeting()}, {studentFirstName}!</h1>
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
          stopName={targetStopName}
          assignedBusPlate={targetPlate}
        />
      ) : (
        <div className="flex-1 min-h-[40vh] bg-[#0a0e1a] flex items-center justify-center">
           <div className="text-center p-6">
             <MapPin className="h-12 w-12 mx-auto text-slate-600 mb-3" />
             <p className="font-medium text-slate-300 mb-1">No Active Tracking</p>
             <p className="text-sm text-slate-500">Waiting for bus assignment...</p>
           </div>
        </div>
      )}

      {/* Bottom Information Panel — Now LIVE */}
      {route && targetBusId ? (
        <StudentInfoPanel
          busId={targetBusId}
          stopLat={targetStopLat!}
          stopLng={targetStopLng!}
          stopName={targetStopName}
          assignedBusPlate={targetPlate}
          routeDuration={routeDuration}
        />
      ) : (
        <div className="bg-[#0f172a] border-t border-slate-800 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 pb-16">
          <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto my-3 mt-4"></div>
          <div className="p-8 text-center text-slate-500">
             <Navigation className="h-12 w-12 mx-auto text-slate-600 mb-3" />
             <p className="font-medium text-slate-300 mb-1">No Active Assignment</p>
             <p className="text-sm">You do not currently have a registered stop or route assigned.</p>
          </div>
        </div>
      )}
    </div>
  );
}
