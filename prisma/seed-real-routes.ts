import { prisma } from "../src/lib/prisma";

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

async function main() {
  console.log("Safely unlinking existing associations...");

  // Unlink students from any stops
  await prisma.student.updateMany({
    data: { stopId: null },
  });

  // Unlink buses from routes
  await prisma.bus.updateMany({
    data: { routeId: null },
  });

  console.log("Purging old trips, constraints, stops and routes...");
  // Clear dependants
  await prisma.trip.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.stopRequest.deleteMany({});
  await prisma.alert.deleteMany({}); // Delete old alerts that might reference old routes indirectly
  
  // Now clear Stops & Routes
  await prisma.stop.deleteMany({});
  await prisma.route.deleteMany({});

  console.log("Database cleared safely. Injecting real JGI routes...");

  const buses = await prisma.bus.findMany({ take: 5, orderBy: { busId: "asc" } });

  // Add the 5 routes sequentially
  for (let i = 0; i < realRoutes.length; i++) {
    const routeData = realRoutes[i];
    
    const createdRoute = await prisma.route.create({
      data: {
        name: routeData.name,
        description: routeData.description,
        color: routeData.color,
        distance: routeData.stops.length * 3.5, // Mocked total distance parameter
        duration: routeData.stops.length * 5,   // Mocked approx duration parameter
        status: "ACTIVE",
      }
    });

    // Create the stops specifically linked to this route
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

    console.log(`✅ Seeded ${routeData.name} (${routeData.stops.length} stops)`);

    // Assign a bus if one is available
    if (buses[i]) {
      await prisma.bus.update({
        where: { id: buses[i].id },
        data: { routeId: createdRoute.id }
      });
    }
  }

  // Generate a few random trips so dashboard doesn't look empty immediately
  console.log("Generating recent trip histories...");
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
          startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
          endTime: new Date(Date.now() - 1000 * 60 * 60 * 22)
        }
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
