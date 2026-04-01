const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function backupAssignments() {
  const prisma = new PrismaClient();
  try {
    const buses = await prisma.bus.findMany({
      where: { driverId: { not: null } },
      select: { id: true, driverId: true }
    });
    fs.writeFileSync('assignments_backup.json', JSON.stringify(buses, null, 2));
    console.log(`Backed up ${buses.length} assignments.`);
  } catch (e) {
    console.error("Backup failed", e);
  } finally {
    await prisma.$disconnect();
  }
}

backupAssignments();
