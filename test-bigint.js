const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const driverData = await prisma.driver.findFirst();
  console.log("DRIVER DATA:", driverData);

  const activeSchedule = driverData ? await prisma.schedule.findFirst({
    where: { driverId: driverData.id },
    include: {
      route: {
        include: { stops: { orderBy: { order: "asc" } }, buses: true }
      }
    }
  }) : null;

  console.log("SCHEDULE DATA FOUND");
  
  // Recursively search for bigint
  function findBigInt(obj, path = "") {
    if (obj === null || obj === undefined) return;
    if (typeof obj === 'bigint') {
       console.log(`FOUND BIGINT AT PATH: ${path} = ${obj}`);
    } else if (typeof obj === 'object') {
       for (const key in obj) {
         findBigInt(obj[key], path ? `${path}.${key}` : key);
       }
    }
  }

  findBigInt(activeSchedule);
  console.log("DONE SEARCHING");
  process.exit(0);
}

test();
