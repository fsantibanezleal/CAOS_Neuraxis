import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: {
    proxy: { '/operations-api': { target: 'http://127.0.0.1:4178', changeOrigin: false } },
  },
  preview: {
    proxy: { '/operations-api': { target: 'http://127.0.0.1:4178', changeOrigin: false } },
  },
  test: { environment: 'node', globals: true },
});
