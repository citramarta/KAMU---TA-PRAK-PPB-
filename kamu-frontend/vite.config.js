import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Service worker di-generate otomatis (Workbox) saat `npm run build`
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "KAMU - Marketplace Mahasiswa",
        short_name: "KAMU",
        description: "Jual beli barang baru dan preloved khusus mahasiswa.",
        lang: "id",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#1F4D3A",
        background_color: "#F8F4EC",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        // App shell (HTML, JS, CSS, ikon) di-precache -> aplikasi tetap terbuka saat offline
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Data dari API sendiri: coba jaringan dulu, kalau offline pakai cache terakhir
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "kamu-api",
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Foto barang (bisa dari domain lain)
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "kamu-images",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
