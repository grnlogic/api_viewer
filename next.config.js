/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [],
  images: {
    domains: ["localhost", "45.158.126.252"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "45.158.126.252",
        port: "8082",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  // Enable Server-Sent Events
  async headers() {
    return [
      {
        source: "/api/sse/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Connection",
            value: "keep-alive",
          },
        ],
      },
    ];
  },
  // Enable CORS for backend communication
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://45.158.126.252:8082/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
