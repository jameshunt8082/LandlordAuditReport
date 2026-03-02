/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  // Force @react-pdf packages to be bundled with the app's React instance
  // rather than using node_modules copies (which have their own React)
  transpilePackages: ['@react-pdf/renderer', '@react-pdf/reconciler'],
};

export default nextConfig;
