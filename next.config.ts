import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable lightningcss to avoid native build issues on some hosts (e.g. Vercel)
    optimizeCss: false,
  },
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
        hostname: "192.168.0.105",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  allowedDevOrigins: ["http://192.168.0.105"],
  trailingSlash: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
