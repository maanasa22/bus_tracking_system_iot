import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
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

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ============================================
  // USERS
  // ============================================
  const adminUser = await prisma.user.create({
    data: {
      name: "Yash Raj",
      email: "admin@tracyg.in",
      passwordHash: hash("admin123"),
      role: "ADMIN",
      phone: "+91 9876543210",
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      name: "Dr. Srinivas Kumar",
      email: "super@tracyg.in",
      passwordHash: hash("super123"),
      role: "SUPER_ADMIN",
      phone: "+91 9876543200",
    },
  });

  // Driver users
  const driverUsers = await Promise.all([
    prisma.user.create({ data: { name: "Ramesh Gowda", email: "ramesh@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000001" } }),
    prisma.user.create({ data: { name: "Suresh Patil", email: "suresh@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000002" } }),
    prisma.user.create({ data: { name: "Venkat Rao", email: "venkat@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000003" } }),
    prisma.user.create({ data: { name: "Prakash Shetty", email: "prakash@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000004" } }),
    prisma.user.create({ data: { name: "Mahesh Kumar", email: "mahesh@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000005" } }),
    prisma.user.create({ data: { name: "Ravi Shankar", email: "ravi@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000006" } }),
    prisma.user.create({ data: { name: "Anil Kumble", email: "anil@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000007" } }),
    prisma.user.create({ data: { name: "Deepak Nair", email: "deepak@tracyg.in", passwordHash: hash("driver123"), role: "DRIVER", phone: "+91 9876000008" } }),
  ]);

  // Student users
  const studentUsers = await Promise.all([
    prisma.user.create({ data: { name: "Arjun Maheshwari", email: "arjun@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Sneha Reddy", email: "sneha@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Karthik Verma", email: "karthik@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Pooja Singh", email: "pooja@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Rahul Desai", email: "rahul@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Divya Krishnan", email: "divya@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Amit Joshi", email: "amit@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Priya Nair", email: "priya@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Vikram Bhat", email: "vikram@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
    prisma.user.create({ data: { name: "Meera Iyer", email: "meera@student.edu", passwordHash: hash("student123"), role: "STUDENT" } }),
  ]);

  // ============================================
  // DRIVER PROFILES
  // ============================================
  const drivers = await Promise.all(
    driverUsers.map((u, i) =>
      prisma.driver.create({
        data: {
          licenseNo: `KA${String(i + 1).padStart(2, "0")}DL${String(2020 + i).slice(-4)}${String(1000 + i * 111)}`,
          userId: u.id,
        },
      })
    )
  );

  // ============================================
  // ROUTES & STOPS (Real Bangalore coordinates)
  // ============================================
  const routesData = [
    {
      name: "Route A",
      description: "North Campus Express",
      color: "#6366f1",
      distance: 18.5,
      duration: 75,
      stops: [
        { name: "Majestic Bus Stand", lat: 12.9770, lng: 77.5710, order: 1 },
        { name: "Rajajinagar 1st Block", lat: 12.9755, lng: 77.5680, order: 2 },
        { name: "Basaveshwara Nagar", lat: 12.9740, lng: 77.5660, order: 3 },
        { name: "Vijayanagar Circle", lat: 12.9730, lng: 77.5700, order: 4 },
        { name: "RPC Layout", lat: 12.9720, lng: 77.5720, order: 5 },
        { name: "Mahalakshmi Layout", lat: 12.9700, lng: 77.5760, order: 6 },
        { name: "Nandini Layout", lat: 12.9680, lng: 77.5800, order: 7 },
        { name: "Yeswanthpur Circle", lat: 12.9665, lng: 77.5840, order: 8 },
        { name: "Yeswanthpur Station", lat: 12.9650, lng: 77.5870, order: 9 },
        { name: "Malleshwaram 18th Cross", lat: 12.9635, lng: 77.5910, order: 10 },
        { name: "Sadashivanagar", lat: 12.9620, lng: 77.5950, order: 11 },
        { name: "North Campus Gate", lat: 12.9610, lng: 77.5990, order: 12 },
      ],
    },
    {
      name: "Route B",
      description: "South Campus Link",
      color: "#10b981",
      distance: 22.3,
      duration: 85,
      stops: [
        { name: "Silk Board Junction", lat: 12.9177, lng: 77.6233, order: 1 },
        { name: "BTM Layout", lat: 12.9166, lng: 77.6101, order: 2 },
        { name: "Jayanagar 4th Block", lat: 12.9250, lng: 77.5938, order: 3 },
        { name: "Lalbagh Gate", lat: 12.9507, lng: 77.5848, order: 4 },
        { name: "KR Market", lat: 12.9631, lng: 77.5754, order: 5 },
        { name: "Vidhana Soudha", lat: 12.9796, lng: 77.5907, order: 6 },
        { name: "Cubbon Park", lat: 12.9763, lng: 77.5929, order: 7 },
        { name: "MG Road Metro", lat: 12.9756, lng: 77.6057, order: 8 },
        { name: "Trinity Circle", lat: 12.9725, lng: 77.6194, order: 9 },
        { name: "South Campus Gate", lat: 12.9680, lng: 77.6250, order: 10 },
      ],
    },
    {
      name: "Route C",
      description: "East Wing Shuttle",
      color: "#f59e0b",
      distance: 15.8,
      duration: 60,
      stops: [
        { name: "Whitefield Main Road", lat: 12.9698, lng: 77.7500, order: 1 },
        { name: "ITPL Gate", lat: 12.9854, lng: 77.7401, order: 2 },
        { name: "Marathahalli Bridge", lat: 12.9591, lng: 77.7010, order: 3 },
        { name: "HAL Airport Road", lat: 12.9580, lng: 77.6680, order: 4 },
        { name: "Indiranagar 100ft", lat: 12.9784, lng: 77.6408, order: 5 },
        { name: "Ulsoor Lake", lat: 12.9826, lng: 77.6200, order: 6 },
        { name: "East Campus Gate", lat: 12.9800, lng: 77.6100, order: 7 },
      ],
    },
    {
      name: "Route D",
      description: "Hostel Pickup",
      color: "#ef4444",
      distance: 12.1,
      duration: 45,
      stops: [
        { name: "Hostel Block A", lat: 12.9350, lng: 77.5350, order: 1 },
        { name: "Hostel Block B", lat: 12.9370, lng: 77.5370, order: 2 },
        { name: "Kengeri Main Road", lat: 12.9120, lng: 77.4850, order: 3 },
        { name: "RR Nagar", lat: 12.9260, lng: 77.5109, order: 4 },
        { name: "Mysore Road Junction", lat: 12.9400, lng: 77.5450, order: 5 },
        { name: "BSK 3rd Stage", lat: 12.9253, lng: 77.5579, order: 6 },
        { name: "Banashankari Metro", lat: 12.9250, lng: 77.5730, order: 7 },
        { name: "Main Campus Gate", lat: 12.9350, lng: 77.5800, order: 8 },
      ],
    },
    {
      name: "Route E",
      description: "Electronic City Express",
      color: "#06b6d4",
      distance: 28.5,
      duration: 100,
      stops: [
        { name: "Electronic City Phase 1", lat: 12.8456, lng: 77.6603, order: 1 },
        { name: "Bommanahalli", lat: 12.8996, lng: 77.6230, order: 2 },
        { name: "HSR Layout", lat: 12.9116, lng: 77.6381, order: 3 },
        { name: "Koramangala", lat: 12.9352, lng: 77.6245, order: 4 },
        { name: "Domlur", lat: 12.9615, lng: 77.6388, order: 5 },
        { name: "Campus East Wing", lat: 12.9750, lng: 77.6100, order: 6 },
      ],
    },
    {
      name: "Route F",
      description: "Airport Connector",
      color: "#8b5cf6",
      distance: 35.0,
      duration: 120,
      stops: [
        { name: "KIA Terminal", lat: 13.1989, lng: 77.7068, order: 1 },
        { name: "Yelahanka", lat: 13.1007, lng: 77.5963, order: 2 },
        { name: "Hebbal Flyover", lat: 13.0358, lng: 77.5970, order: 3 },
        { name: "Mekhri Circle", lat: 13.0095, lng: 77.5880, order: 4 },
        { name: "Yeshwanthpur", lat: 12.9982, lng: 77.5530, order: 5 },
        { name: "Campus Main Gate", lat: 12.9800, lng: 77.5700, order: 6 },
      ],
    },
  ];

  const createdRoutes: any[] = [];
  const allStops: Array<{ id: string; routeId: string }> = [];

  for (const r of routesData) {
    const route = await prisma.route.create({
      data: {
        name: r.name,
        description: r.description,
        color: r.color,
        distance: r.distance,
        duration: r.duration,
      },
    });
    createdRoutes.push(route);

    for (const s of r.stops) {
      const stop = await prisma.stop.create({
        data: { name: s.name, lat: s.lat, lng: s.lng, order: s.order, routeId: route.id },
      });
      allStops.push({ id: stop.id, routeId: route.id });
    }
  }

  // ============================================
  // STUDENT PROFILES (assign to stops)
  // ============================================
  const stopsForRoute0 = allStops.filter((s) => s.routeId === createdRoutes[0].id);
  await Promise.all(
    studentUsers.map((u, i) =>
      prisma.student.create({
        data: {
          rollNo: `CS21B${String(45 + i).padStart(3, "0")}`,
          userId: u.id,
          stopId: stopsForRoute0[i % stopsForRoute0.length]?.id,
        },
      })
    )
  );

  // ============================================
  // BUSES (8 buses assigned to routes & drivers)
  // ============================================
  const busesData = [
    { busId: "BUS-001", numberPlate: "KA-01-AB-1234", capacity: 52, model: "Tata Starbus", year: 2022, status: "ACTIVE", lat: 12.972, lng: 77.574, speed: 32 },
    { busId: "BUS-002", numberPlate: "KA-01-CD-5678", capacity: 48, model: "Ashok Leyland", year: 2023, status: "ACTIVE", lat: 12.935, lng: 77.610, speed: 28 },
    { busId: "BUS-003", numberPlate: "KA-01-EF-9012", capacity: 52, model: "Tata Starbus", year: 2021, status: "DELAYED", lat: 12.969, lng: 77.741, speed: 15 },
    { busId: "BUS-004", numberPlate: "KA-01-GH-3456", capacity: 40, model: "Eicher 10.75H", year: 2022, status: "ACTIVE", lat: 12.930, lng: 77.540, speed: 45 },
    { busId: "BUS-005", numberPlate: "KA-01-IJ-7890", capacity: 52, model: "Ashok Leyland", year: 2023, status: "ACTIVE", lat: 12.886, lng: 77.654, speed: 38 },
    { busId: "BUS-006", numberPlate: "KA-01-KL-2345", capacity: 48, model: "Tata Starbus", year: 2020, status: "MAINTENANCE", lat: null, lng: null, speed: 0 },
    { busId: "BUS-007", numberPlate: "KA-01-MN-6789", capacity: 40, model: "Eicher 10.75H", year: 2022, status: "IDLE", lat: 12.978, lng: 77.570, speed: 0 },
    { busId: "BUS-008", numberPlate: "KA-01-OP-0123", capacity: 52, model: "Tata Starbus", year: 2024, status: "ACTIVE", lat: 13.100, lng: 77.596, speed: 55 },
  ];

  const createdBuses = [];
  for (let i = 0; i < busesData.length; i++) {
    const b = busesData[i];
    const bus = await prisma.bus.create({
      data: {
        busId: b.busId,
        numberPlate: b.numberPlate,
        capacity: b.capacity,
        model: b.model,
        year: b.year,
        status: b.status,
        currentLat: b.lat,
        currentLng: b.lng,
        currentSpeed: b.speed,
        passengers: Math.floor(Math.random() * b.capacity * 0.8),
        routeId: i < createdRoutes.length ? createdRoutes[i].id : createdRoutes[0].id,
      },
    });

    // Assign driver to this bus (1:N relationship)
    if (i < drivers.length) {
      await prisma.driver.update({
        where: { id: drivers[i].id },
        data: { busId: bus.id }
      });
    }

    createdBuses.push(bus);
  }

  // ============================================
  // DEVICES
  // ============================================
  for (let i = 0; i < createdBuses.length; i++) {
    await prisma.device.create({
      data: {
        deviceId: `DEV-${String(i + 1).padStart(3, "0")}`,
        busId: createdBuses[i].id,
        firmware: i < 4 ? "v2.4.1" : "v2.3.8",
        status: busesData[i].status === "MAINTENANCE" ? "OFFLINE" : busesData[i].status === "ACTIVE" ? "ONLINE" : "OFFLINE",
        battery: 60 + Math.random() * 40,
        signal: Math.floor(Math.random() * 5),
        lastPing: busesData[i].status === "ACTIVE" ? new Date() : new Date(Date.now() - 3600000),
        uptime: 85 + Math.random() * 15,
      },
    });
  }

  // ============================================
  // TRIPS (recent)
  // ============================================
  const now = new Date();
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < Math.min(6, createdBuses.length); i++) {
      const tripDate = new Date(now);
      tripDate.setDate(tripDate.getDate() - day);
      tripDate.setHours(6, 30, 0, 0);

      const endDate = new Date(tripDate);
      endDate.setMinutes(endDate.getMinutes() + 60 + Math.floor(Math.random() * 30));

      await prisma.trip.create({
        data: {
          busId: createdBuses[i].id,
          routeId: i < createdRoutes.length ? createdRoutes[i].id : createdRoutes[0].id,
          startTime: tripDate,
          endTime: day === 0 && i < 3 ? null : endDate,
          status: day === 0 && i < 3 ? "IN_PROGRESS" : "COMPLETED",
          passengers: 20 + Math.floor(Math.random() * 30),
          distance: routesData[i % routesData.length].distance,
          onTime: Math.random() > 0.2,
        },
      });
    }
  }

  // ============================================
  // ALERTS
  // ============================================
  const alertsData = [
    { type: "SPEED", severity: "WARNING", title: "Speed limit exceeded", message: "BUS-008 exceeded 50 km/h near Hebbal Flyover", busIdx: 7 },
    { type: "DEVICE", severity: "CRITICAL", title: "Device offline", message: "DEV-006 lost connection — BUS-006 in maintenance bay", busIdx: 5 },
    { type: "GEOFENCE", severity: "INFO", title: "Campus entry", message: "BUS-001 entered North Campus perimeter", busIdx: 0 },
    { type: "ROUTE", severity: "WARNING", title: "Route deviation", message: "BUS-003 deviated from Route C near Marathahalli", busIdx: 2 },
    { type: "MAINTENANCE", severity: "INFO", title: "Service due", message: "BUS-006 scheduled for 15,000 km service", busIdx: 5 },
    { type: "SOS", severity: "CRITICAL", title: "Emergency alert", message: "SOS triggered by driver on BUS-004 near Mysore Road", busIdx: 3 },
    { type: "DEVICE", severity: "WARNING", title: "Low battery", message: "DEV-003 battery at 18% — charge recommended", busIdx: 2 },
    { type: "GEOFENCE", severity: "SUCCESS", title: "Route completed", message: "BUS-002 completed Route B — all stops covered", busIdx: 1 },
    { type: "SPEED", severity: "INFO", title: "Speed normal", message: "BUS-005 operating within safe speed limits", busIdx: 4 },
    { type: "ROUTE", severity: "WARNING", title: "Delay detected", message: "BUS-003 running 12 min behind schedule on Route C", busIdx: 2 },
  ];

  for (let i = 0; i < alertsData.length; i++) {
    const a = alertsData[i];
    const created = new Date(now);
    created.setMinutes(created.getMinutes() - i * 15);
    await prisma.alert.create({
      data: {
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        busId: createdBuses[a.busIdx]?.id,
        createdAt: created,
      },
    });
  }

  // ============================================
  // SCHEDULES
  // ============================================
  for (let i = 0; i < Math.min(6, createdRoutes.length); i++) {
    for (let day = 1; day <= 5; day++) {
      // Monday-Friday
      await prisma.schedule.create({
        data: {
          routeId: createdRoutes[i].id,
          driverId: i < drivers.length ? drivers[i].id : null,
          dayOfWeek: day,
          startTime: "06:30",
          endTime: "09:30",
          shiftType: "MORNING",
        },
      });
      await prisma.schedule.create({
        data: {
          routeId: createdRoutes[i].id,
          driverId: i < drivers.length ? drivers[i].id : null,
          dayOfWeek: day,
          startTime: "16:00",
          endTime: "19:00",
          shiftType: "AFTERNOON",
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log(`   ${await prisma.user.count()} users`);
  console.log(`   ${await prisma.driver.count()} drivers`);
  console.log(`   ${await prisma.student.count()} students`);
  console.log(`   ${await prisma.route.count()} routes`);
  console.log(`   ${await prisma.stop.count()} stops`);
  console.log(`   ${await prisma.bus.count()} buses`);
  console.log(`   ${await prisma.device.count()} devices`);
  console.log(`   ${await prisma.trip.count()} trips`);
  console.log(`   ${await prisma.alert.count()} alerts`);
  console.log(`   ${await prisma.schedule.count()} schedules`);
  console.log("\n📋 Login credentials:");
  console.log("   Admin:   admin@tracyg.in / admin123");
  console.log("   Driver:  ramesh@tracyg.in / driver123");
  console.log("   Student: arjun@student.edu / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
