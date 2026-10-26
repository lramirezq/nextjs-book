import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto para que Next no se confunda si hay varios
  // package-lock.json en carpetas superiores.
  outputFileTracingRoot: import.meta.dirname,

  // Cabeceras de seguridad básicas para toda la aplicación (capítulo 10 del libro).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
