import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.0.109",
      },
      {
        protocol: "http",
        hostname: "192.168.0.54",
      },
      {
        protocol: "http",
        hostname: "192.168.0.118",
      },
    ],
  },
  allowedDevOrigins: ["http://192.168.0.118"],
};

export default nextConfig;
