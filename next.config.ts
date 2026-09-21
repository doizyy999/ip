import type { NextConfig } from "next";

// Next.js 16: Turbopack is the default bundler, config file is optional.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // ppr: true, // Partial Prerendering (opsional)
  },
};

export default nextConfig;
