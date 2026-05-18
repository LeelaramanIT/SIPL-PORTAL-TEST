import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["favicon.svg"],

      manifest: {
        name: "Inventory System",
        short_name: "Inventory",
        theme_color: "#2563eb",

        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,

        // 🔥 ADD THIS
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "document",

            handler: "NetworkFirst",

            options: {
              cacheName: "pages",
            },
          },
        ],
      },
    }),
  ],

  optimizeDeps: {
    include: ['redux-persist-transform-encrypt'],
  },

  server: {
    port: 5174,
    host: '0.0.0.0'
  }
})