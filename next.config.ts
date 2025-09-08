import type { NextConfig } from "next";
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");
const path = require("path");

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
