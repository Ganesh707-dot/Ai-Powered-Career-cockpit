import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Same-origin /api/v1/* → FastAPI (avoids CORS in production)
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/api/v1/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl.replace(/\/$/, "")}/health`,
      },
    ];
  },
};

export default nextConfig;
