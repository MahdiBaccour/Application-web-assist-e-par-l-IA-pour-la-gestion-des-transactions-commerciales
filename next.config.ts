import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // Allow images from Cloudinary
  },
  async rewrites() {
    return [
        {
            source: '/api/auth/:path*',
            destination: '/api/auth/:path*', // Keep local NextAuth routes
        },
    ];
},
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb", // Example value for body size limit
      allowedOrigins: ["*"], // Example value to allow all origins
    }, // (Optional) Enable experimental Next.js features
  },
};

export default nextConfig;