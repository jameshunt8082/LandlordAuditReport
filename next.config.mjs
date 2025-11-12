/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for Next.js 16 + Vercel
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
