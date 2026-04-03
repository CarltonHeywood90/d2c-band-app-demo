import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Adjust this based on your average .wav size
    },
  },
};

export default nextConfig;
