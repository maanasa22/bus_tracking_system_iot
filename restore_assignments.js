const { PrismaClient } = require('@prisma/client');

async function restoreAssignments() {
  const prisma = new PrismaClient();
  
  const assignments = [
    { driverName: "Anil Kumble", plate: "KA-01-BUS-999" },
    { driverName: "Deepak Nair", plate: "KA-01-OP-0123" },
    { driverName: "Ravi Shankar", plate: "KA-01-KL-2345" },
    { driverName: "Prakash N", plate: "KA-02-D-9900" },
    { driverName: "Gowda K", plate: "KA-53-G-1122" },
    { driverName: "Shivakumar M", plate: "KA-04-F-8877" },
    { driverName: "Manjunath S", plate: "KA-51-AB-4321" },
    { driverName: "Venkatesh R", plate: "KA-01-AF-1234" }
  ];

  try {
    for (const assignment of assignments) {
      const bus = await prisma.bus.findUnique({
        where: { numberPlate: assignment.plate }
      });

      const driver = await prisma.driver.findFirst({
        where: { user: { name: assignment.driverName } }
      });

      if (bus && driver) {
        await prisma.driver.update({
          where: { id: driver.id },
          data: { busId: bus.id }
        });
        console.log(`Restored: ${assignment.driverName} -> ${assignment.plate}`);
      } else {
        console.warn(`Could not restore: ${assignment.driverName} (${!!driver}) to ${assignment.plate} (${!!bus})`);
      }
    }
  } catch (e) {
    console.error("Restoration failed", e);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAssignments();
