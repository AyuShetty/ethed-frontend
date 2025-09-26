import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Add social/OAuth avatar support for Google
      // ...any other remote image domains you need
    ],
  },
};

export default nextConfig;
