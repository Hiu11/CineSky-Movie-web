import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          lottie: ['lottie-react', 'lottie-web'],
          barcode: ['@zxing/browser', 'jsbarcode', 'qrcode']
        }
      }
    }
  }
});
