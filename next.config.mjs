/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración vacía de Turbopack para silenciar warning
  turbopack: {},
  
  // Aumentar el límite de tamaño de la función para PDFs
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

