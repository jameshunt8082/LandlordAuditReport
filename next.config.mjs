/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium', '@react-pdf/renderer'],
};

export default nextConfig;
