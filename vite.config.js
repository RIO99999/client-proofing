import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// In dev, /api is proxied to the Express server so the browser never hits CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
