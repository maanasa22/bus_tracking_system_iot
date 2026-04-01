export const dynamic = " force-dynamic;
import { prisma } from "@/lib/prisma";
import { AlertsClientInterface } from "./AlertsClientInterface";

export default async function AlertsPage() {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        bus: {
          select: { numberPlate: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const replacer = (k: string, v: any) => typeof v === 'bigint' ? v.toString() : v;
    const alertData = JSON.parse(JSON.stringify(alerts, replacer));

    return <AlertsClientInterface alerts={alertData} />;
  } catch (error: any) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl text-red-500 font-bold">Alerts Page Debug Error</h1>
        <pre className="bg-black text-red-300 p-4 rounded-lg overflow-auto">
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
      </div>
    );
  }
}
