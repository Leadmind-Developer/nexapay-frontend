import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com", // Cloudinary
      "images.unsplash.com", // example
      "cdn.nexa.com.ng", // your host
    ],
  },
};

export default nextConfig;
