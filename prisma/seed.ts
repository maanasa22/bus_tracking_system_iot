import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

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
  console.log("🌱 Seeding database with 5+2 state...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // 1. Clean existing data
  await prisma.stopRequest.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.device.deleteMany();
  await prisma.student.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Base Users
  const admin = await prisma.user.create({
    data: { name: "Yash Raj", email: "admin@tracyg.in", passwordHash: hash("admin123"), role: "ADMIN", phone: "+91 9876543210" }
  });

  const superAdmin = await prisma.user.create({
    data: { name: "Dr. Srinivas Kumar", email: "super@tracyg.in", passwordHash: hash("super123"), role: "SUPER_ADMIN", phone: "+91 9876543200" }
  });

  // 3. Create 7 Drivers (5 Assigned, 2 Unassigned)
  const driverNames = ["Venkatesh R", "Manjunath S", "Shivakumar M", "Gowda K", "Prakash N", "Anil Kumble", "Deepak Nair"];
  const driverProfiles = await Promise.all(driverNames.map(async (name, i) => {
    const user = await prisma.user.create({
      data: { name, email: `${name.toLowerCase().replace(" ", "")}@tracyg.in`, passwordHash: hash("driver123"), role: "DRIVER", phone: `+91 987600000${i+1}` }
    });
    return prisma.driver.create({
      data: { userId: user.id, licenseNo: `KA01DL2024${1000 + i}` }
    });
  }));

  // 4. Create 5 Routes & Stops
  const createdRoutes = [];
  for (const r of realRoutes) {
    const route = await prisma.route.create({
      data: { name: r.name, description: r.description, color: r.color, distance: r.stops.length * 2.5, duration: r.stops.length * 6, status: "ACTIVE" }
    });
    createdRoutes.push(route);
    await Promise.all(r.stops.map((s, idx) => 
      prisma.stop.create({ data: { name: s.name, lat: s.lat, lng: s.lng, order: idx + 1, routeId: route.id } })
    ));
  }

  // 5. Create 7 Buses (5 Active on Routes, 2 Inactive/Unlinked)
  const busPlates = ["KA-01-AF-1234", "KA-51-AB-4321", "KA-04-F-8877", "KA-53-G-1122", "KA-02-D-9900", "KA-01-EX-9999", "KA-01-EX-8888"];
  const createdBuses = await Promise.all(busPlates.map(async (plate, i) => {
    return prisma.bus.create({
      data: {
        busId: `BUS-00${i+1}`,
        numberPlate: plate,
        status: i < 5 ? "ACTIVE" : "IDLE",
        routeId: i < 5 ? createdRoutes[i].id : null,
        capacity: 60,
        model: "Ashok Leyland Falcon",
        year: 2022,
        currentLat: i < 5 ? realRoutes[i].stops[0].lat : null,
        currentLng: i < 5 ? realRoutes[i].stops[0].lng : null
      }
    });
  }));

  // 6. Link 5 Drivers to the 5 Active Buses
  for (let i = 0; i < 5; i++) {
    await prisma.driver.update({
      where: { id: driverProfiles[i].id },
      data: { busId: createdBuses[i].id }
    });
  }

  // 7. Create some students & schedules for Route 1
  const route1Stops = await prisma.stop.findMany({ where: { routeId: createdRoutes[0].id } });
  const students = ["Arjun M", "Sneha R", "Karthik V", "Pooja S", "Rahul D"];
  await Promise.all(students.map(async (name, i) => {
    const user = await prisma.user.create({ data: { name, email: `${name.toLowerCase().replace(" ", "")}.std@jgi.edu`, passwordHash: hash("student123"), role: "STUDENT" } });
    return prisma.student.create({ data: { userId: user.id, rollNo: `CS${2100+i}`, stopId: route1Stops[i % route1Stops.length].id } });
  }));

  // 8. Create Morning/Evening Schedules for the 5 active routes
  for (let i = 0; i < 5; i++) {
    for (let day = 1; day <= 5; day++) {
       await prisma.schedule.create({ data: { routeId: createdRoutes[i].id, driverId: driverProfiles[i].id, dayOfWeek: day, startTime: "07:30", endTime: "09:30", shiftType: "MORNING" } });
       await prisma.schedule.create({ data: { routeId: createdRoutes[i].id, driverId: driverProfiles[i].id, dayOfWeek: day, startTime: "16:30", endTime: "18:30", shiftType: "AFTERNOON" } });
    }
  }

  console.log("✅ 5 Active Routes restored.");
  console.log("✅ 5 Buses/Drivers assigned.");
  console.log("✅ 2 Extra Drivers created (unassigned).");
  console.log("✅ 2 Extra Buses created (inactive/unlinked).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
