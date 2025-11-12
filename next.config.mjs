/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de Turbopack (Next.js 16 default)
  turbopack: {},
  
  // CRÍTICO: Excluir canvas de serverless bundle
  // Canvas no puede ejecutarse en Vercel serverless (requiere binarios nativos)
  serverExternalPackages: ['canvas', 'sharp'],
  
  // TEMPORAL: Deshabilitar minification para ver error completo
  swcMinify: false,
  
  // Deshabilitar optimización de producción para debugging
  productionBrowserSourceMaps: true,
  
  compiler: {
    removeConsole: false,
  },
  
  // Aumentar el límite de tamaño de la función para PDFs
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

// Force deployment trigger
export default nextConfig;
