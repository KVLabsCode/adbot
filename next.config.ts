import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/studio",
        destination: "/chat",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
