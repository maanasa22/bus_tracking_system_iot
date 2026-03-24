import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Webpack instead of Turbopack to avoid BigInt serialization crash
  // with Prisma SQLite adapter in custom server mode
  turbopack: undefined, // explicitly not configuring turbopack
};

export default nextConfig;
