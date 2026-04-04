export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { RoutesClientInterface } from "./RoutesClientInterface";

export default async function RoutesPage() {
  try {
    const rawRoutes = await prisma.route.findMany({
      include: {
        stops: {
          orderBy: { order: "asc" },
          include: { students: true }
        },
        buses: true,
        schedules: {
          take: 1
        }
      },
      orderBy: { name: "asc" }
    });

    // Serialize to strip BigInt/Date objects that crash React Flight
    const replacer = (k: string, v: any) => typeof v === 'bigint' ? v.toString() : v;
    const routes = JSON.parse(JSON.stringify(rawRoutes, replacer));

    return <RoutesClientInterface routes={routes} />;
  } catch (error: any) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl text-red-500 font-bold">Routes Page Error</h1>
        <pre className="bg-black text-red-300 p-4 rounded-lg overflow-auto">
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
      </div>
    );
  }
}
