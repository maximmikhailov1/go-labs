import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Для Docker
  reactStrictMode: true,
  images: {
    unoptimized: true, // Если не используете оптимизацию изображений
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: (process.env.NEXT_PUBLIC_API_URL+"/api/:path*") || "http://backend:3222/api/:path*",
      },
    ];
  },
};

export default nextConfig;