import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const realRoutes = [
  {
    name: "Route 1 - Hebbal Flyover",
    description: "Hebbal Flyover Under Pass",
    color: "#6366f1",
    stops: [
      { name: "Hebbal Fly Over", lat: 13.0400, lng: 77.5900 },
      { name: "CBI road", lat: 13.0265, lng: 77.5876 },
      { name: "Mekhri Circle", lat: 13.0203, lng: 77.5837 },
      { name: "Freedom Park", lat: 12.9774, lng: 77.5821 },
      { name: "Corporation Circle", lat: 12.9672, lng: 77.5877 },
      { name: "Lalbagh Main Gate", lat: 12.9541, lng: 77.5846 },
      { name: "RV Road", lat: 12.9402, lng: 77.5801 },
      { name: "Yediyur", lat: 12.9301, lng: 77.5763 },
      { name: "Banashankari Bus Stand", lat: 12.9179, lng: 77.5738 },
      { name: "JP Nagar Signal", lat: 12.9079, lng: 77.5756 },
      { name: "Yelachenahalli", lat: 12.9006, lng: 77.5692 },
      { name: "Jain Global Campus", lat: 12.6366, lng: 77.4243 }
    ]
  },
  {
    name: "Route 2 - Mysore Circle",
    description: "Mysore Circle to JGI",
    color: "#10b981",
    stops: [
      { name: "Chamarajpet", lat: 12.9577, lng: 77.5665 },
      { name: "Nandini Layout", lat: 13.0125, lng: 77.5333 },
      { name: "Ramakrishna Ashram", lat: 12.9431, lng: 77.5684 },
      { name: "Hanumanthanagar", lat: 12.9427, lng: 77.5583 },
      { name: "PES College", lat: 12.9415, lng: 77.5543 },
      { name: "Muneshwara Block", lat: 12.9503, lng: 77.5469 },
      { name: "Srinagar", lat: 12.9484, lng: 77.5514 },
      { name: "Sita Circle", lat: 12.9379, lng: 77.5497 },
      { name: "Bank Colony", lat: 13.0706, lng: 77.5659 },
      { name: "Vidyapeeta Circle", lat: 12.9354, lng: 77.5583 },
      { name: "Kathriguppe Signal", lat: 12.9234, lng: 77.5489 },
      { name: "Kadirenahalli", lat: 12.9175, lng: 77.5611 },
      { name: "Chikkalasandra", lat: 12.9121, lng: 77.5476 },
      { name: "Uttarahalli", lat: 12.9055, lng: 77.5455 },
      { name: "Gubbalala", lat: 12.8856, lng: 77.5416 },
      { name: "KSIT Signal", lat: 12.8792, lng: 77.5446 },
      { name: "Jnana Sweekar School", lat: 12.8718, lng: 77.5332 },
      { name: "Jain Global Campus", lat: 12.6366, lng: 77.4243 }
    ]
  },
  {
    name: "Route 3 - Veerabhadhra Nagara",
    description: "Veerabhadhra Nagara to JGI",
    color: "#f59e0b",
    stops: [
      { name: "Veerabhadhra Nagar", lat: 12.9351, lng: 77.5456 },
      { name: "Hosakerehalli Petrol Bunk", lat: 12.9328, lng: 77.5403 },
      { name: "Kamakhya Theater", lat: 12.9238, lng: 77.5478 },
      { name: "Sagar Hospital", lat: 12.9078, lng: 77.5651 },
      { name: "Kumaraswamy Layout", lat: 12.9150, lng: 77.5678 },
      { name: "ISRO Layout", lat: 12.8974, lng: 77.5573 },
      { name: "Doddakallasandra", lat: 12.8857, lng: 77.5557 },
      { name: "Talaghattapura", lat: 12.8718, lng: 77.5332 },
      { name: "Silk Institute Metro", lat: 12.8610, lng: 77.5297 },
      { name: "Agara Cross", lat: 12.8491, lng: 77.5220 },
      { name: "Kaggalipura", lat: 12.8089, lng: 77.5097 },
      { name: "Jain Global Campus", lat: 12.6366, lng: 77.4243 }
    ]
  },
  {
    name: "Route 4 - Yelahanka",
    description: "Yelahanka Mother Dairy",
    color: "#ec4899",
    stops: [
      { name: "Mother Dairy Yelahanka", lat: 13.0959, lng: 77.5732 },
      { name: "MS Palya", lat: 13.0816, lng: 77.5482 },
      { name: "Gangamma Circle", lat: 13.0563, lng: 77.5463 },
      { name: "Jalahalli Circle", lat: 13.0559, lng: 77.5578 },
      { name: "Kanteerava Studio", lat: 13.0194, lng: 77.5331 },
      { name: "Laggere Bridge", lat: 13.0084, lng: 77.5266 },
      { name: "Kottigepalya", lat: 12.9845, lng: 77.5118 },
      { name: "Dr. Ambedkar Institute", lat: 12.9645, lng: 77.5065 },
      { name: "Mariyappana Palya", lat: 13.0500, lng: 77.6118 },
      { name: "RR Medical College", lat: 12.9623, lng: 77.5736 },
      { name: "Bidadi Cross", lat: 12.8668, lng: 77.4538 },
      { name: "Jain Global Campus", lat: 12.6366, lng: 77.4243 }
    ]
  },
  {
    name: "Route 5 - BEL Circle",
    description: "BEL Circle to JGI",
    color: "#3b82f6",
    stops: [
      { name: "BEL Circle", lat: 13.0455, lng: 77.5564 },
      { name: "Dollars Colony", lat: 13.0334, lng: 77.5756 },
      { name: "IISc", lat: 13.0222, lng: 77.5671 },
      { name: "Malleswaram 18th Cross", lat: 13.0088, lng: 77.5689 },
      { name: "Devaiah Park", lat: 12.9964, lng: 77.5630 },
      { name: "Navarang Theater", lat: 12.9922, lng: 77.5529 },
      { name: "Magadi Road Tollgate", lat: 12.9737, lng: 77.5498 },
      { name: "Vijayanagar Bus Stop", lat: 12.9731, lng: 77.5381 },
      { name: "Chandra Layout", lat: 12.9553, lng: 77.5238 },
      { name: "Nagarbhavi Circle", lat: 12.9580, lng: 77.5189 },
      { name: "Nayandahalli", lat: 12.9413, lng: 77.5212 },
      { name: "Rajarajeshwari Nagar Gate", lat: 12.9304, lng: 77.5186 },
      { name: "SBI RR Nagar", lat: 12.9281, lng: 77.5192 },
      { name: "Jain Global Campus", lat: 12.6366, lng: 77.4243 }
    ]
  }
];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'SUPERADMIN' && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Safely unlinking existing associations...");
    await prisma.student.updateMany({ data: { stopId: null } });
    await prisma.bus.updateMany({ data: { routeId: null } });

    console.log("Purging old trips, constraints, stops and routes...");
    await prisma.trip.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.stopRequest.deleteMany({});
    await prisma.alert.deleteMany({});
    await prisma.stop.deleteMany({});
    await prisma.route.deleteMany({});

    console.log("Database cleared safely. Injecting real JGI routes...");
    const buses = await prisma.bus.findMany({ 
      take: 5, 
      orderBy: { busId: "asc" },
      include: { driver: { include: { user: true } } }
    });

    const realDriverNames = ["Venkatesh R", "Manjunath S", "Shivakumar M", "Gowda K", "Prakash N"];
    const realBusPlates = ["KA-01-AF-1234", "KA-51-AB-4321", "KA-04-F-8877", "KA-53-G-1122", "KA-02-D-9900"];

    for (let i = 0; i < realRoutes.length; i++) {
        const routeData = realRoutes[i];
        const createdRoute = await prisma.route.create({
          data: {
            name: routeData.name,
            description: routeData.description,
            color: routeData.color,
            distance: routeData.stops.length * 3.5, 
            duration: routeData.stops.length * 5,
            status: "ACTIVE",
          }
        });
    
        for (let j = 0; j < routeData.stops.length; j++) {
          await prisma.stop.create({
            data: {
              name: routeData.stops[j].name,
              lat: routeData.stops[j].lat,
              lng: routeData.stops[j].lng,
              order: j + 1,
              routeId: createdRoute.id
            }
          });
        }
    
        if (buses[i]) {
          await prisma.bus.update({
            where: { id: buses[i].id },
            data: { 
              routeId: createdRoute.id,
              numberPlate: realBusPlates[i],
              model: "Ashok Leyland Falcon",
              capacity: 60,
              year: 2022
            }
          });

          if (buses[i].driver && buses[i].driver?.user) {
            await prisma.user.update({
              where: { id: buses[i].driver!.user.id },
              data: {
                name: realDriverNames[i],
                phone: `+91 98765 4321${i}`
              }
            });
          }
        }
    }

    // Generate some completed trips for the new routes
    const newRoutes = await prisma.route.findMany({ include: { buses: true } });
    for (const r of newRoutes) {
      if (r.buses.length > 0) {
        await prisma.trip.create({
          data: {
            routeId: r.id,
            busId: r.buses[0].id,
            passengers: Math.floor(Math.random() * 30) + 10,
            status: "COMPLETED",
            distance: r.distance,
            onTime: true,
            startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
            endTime: new Date(Date.now() - 1000 * 60 * 60 * 22)
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: "Successfully seeded 5 real routes and reset DB." });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
