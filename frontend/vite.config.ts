import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// VERSION is the single source of the version, injected as __APP_VERSION__ (T4).
const VERSION = readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim();

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(VERSION) },
  server: {
    proxy: { '/operations-api': { target: 'http://127.0.0.1:4178', changeOrigin: false } },
  },
  preview: {
    proxy: { '/operations-api': { target: 'http://127.0.0.1:4178', changeOrigin: false } },
  },
  test: { environment: 'node', globals: true },
});
