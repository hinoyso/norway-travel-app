import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "weather-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
      },
    },
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "maps-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "openweathermap.org" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "10.100.102.14:3000"] },
  },
};

module.exports = withPWA(nextConfig);
