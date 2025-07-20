/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://wedding-photo-upload-two.vercel.app, http://localhost:3002" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  // Désactive le cache pour les fichiers statiques en développement
  poweredByHeader: false,
  // Active la compilation stricte
  reactStrictMode: true,
  // Configuration pour les fichiers statiques
  images: {
    domains: ['ik.imagekit.io'],
  },
}

module.exports = nextConfig
