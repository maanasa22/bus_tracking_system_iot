import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "./AnalyticsCharts";

export default async function AnalyticsPage() {
  // KPI Queries
  const [totalTrips, onTimeTrips, allTrips, safetyIncidents] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.count({ where: { onTime: true } }),
    prisma.trip.findMany({ select: { passengers: true, startTime: true } }),
    prisma.alert.count({ where: { type: { in: ["SPEED", "SOS"] } } }),
  ]);

  // On-time performance
  const onTimePercent = totalTrips > 0 ? parseFloat(((onTimeTrips / totalTrips) * 100).toFixed(1)) : 0;

  // Average daily ridership
  const totalPassengers = allTrips.reduce((sum, t) => sum + (t.passengers || 0), 0);
  const uniqueDays = new Set(allTrips.map(t => new Date(t.startTime).toISOString().slice(0, 10))).size;
  const avgDailyRidership = uniqueDays > 0 ? Math.round(totalPassengers / uniqueDays) : 0;

  // Monthly trip data — last 6 months
  const monthlyData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = monthStart.toLocaleDateString("en-IN", { month: "short" });
    
    const [trips, onTime] = await Promise.all([
      prisma.trip.count({ where: { startTime: { gte: monthStart, lt: monthEnd } } }),
      prisma.trip.count({ where: { startTime: { gte: monthStart, lt: monthEnd }, onTime: true } }),
    ]);
    
    monthlyData.push({ month: monthName, trips, onTime });
  }

  // Hourly utilization — aggregate trips by start hour from last 30 days
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTrips = await prisma.trip.findMany({
    where: { startTime: { gte: thirtyDaysAgo } },
    select: { startTime: true }
  });

  // Count trips per hour bucket
  const hourBuckets: Record<number, number> = {};
  for (const t of recentTrips) {
    const hr = new Date(t.startTime).getHours();
    hourBuckets[hr] = (hourBuckets[hr] || 0) + 1;
  }
  
  // Normalize to % of peak
  const peakCount = Math.max(...Object.values(hourBuckets), 1);
  const hourlyData = [6, 7, 8, 9, 14, 15, 16, 17].map(hr => ({
    time: `${String(hr).padStart(2, "0")}:00`,
    load: Math.round(((hourBuckets[hr] || 0) / peakCount) * 100),
  }));

  return (
    <AnalyticsCharts
      monthlyData={monthlyData}
      hourlyData={hourlyData}
      kpis={{
        totalTrips,
        onTimePercent,
        avgDailyRidership,
        safetyIncidents,
      }}
    />
  );
}
