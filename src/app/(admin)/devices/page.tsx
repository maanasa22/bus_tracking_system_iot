export const dynamic = " force-dynamic;
import { prisma } from "@/lib/prisma";
import { DevicesClientInterface } from "./DevicesClientInterface";

export default async function DevicesPage() {
  try {
    const devices = await prisma.device.findMany({
      include: {
        bus: {
          select: { numberPlate: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Serialize BigInt and Date properly
    const replacer = (k: string, v: any) => typeof v === 'bigint' ? v.toString() : v;
    const devicesWithDatesStringified = JSON.parse(JSON.stringify(devices, replacer));

    return <DevicesClientInterface devices={devicesWithDatesStringified} />;
  } catch (error: any) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl text-red-500 font-bold">Devices Page Debug Error</h1>
        <pre className="bg-black text-red-300 p-4 rounded-lg overflow-auto">
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
      </div>
    );
  }
}
