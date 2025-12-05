import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Listen on all network interfaces
    open: true,
  },
  optimizeDeps: {
    exclude: ['react-leaflet', 'leaflet'], // Exclude from pre-bundling
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
