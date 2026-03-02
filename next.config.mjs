/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  // Force all @react-pdf packages to be bundled with the app's React instance
  // rather than using node_modules copies (which have their own React,
  // causing element format mismatch and React error #31)
  transpilePackages: [
    '@react-pdf/renderer',
    '@react-pdf/reconciler',
    '@react-pdf/layout',
    '@react-pdf/font',
    '@react-pdf/image',
    '@react-pdf/pdfkit',
    '@react-pdf/primitives',
    '@react-pdf/stylesheet',
    '@react-pdf/textkit',
    '@react-pdf/types',
    '@react-pdf/fns',
  ],
};

export default nextConfig;
