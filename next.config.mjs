/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    API_PROD_URL: "http://localhost:3000/api",
    storageURL: "http://localhost:3000",
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
};

export default nextConfig;
