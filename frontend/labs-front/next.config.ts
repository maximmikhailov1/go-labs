import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return[
      {
        source: "/api/:path*",
        destination: process.env.BACKEND_URL + "/api/:path*", //
      }, 
    ];
  },
};
//process.env.BACKEND_URL + 
export default nextConfig;
