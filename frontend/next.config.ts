import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is required so the Cloud Run image can ship a minimal
  // Node server (no node_modules at runtime, no extra Next CLI surface).
  output: "standalone",
};

export default nextConfig;
