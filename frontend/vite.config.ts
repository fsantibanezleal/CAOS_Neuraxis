import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const VERSION = readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim();

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  define: { __APP_VERSION__: JSON.stringify(VERSION) },
  plugins: [react()],
  server: {
    proxy: { '/operations-api': { target: 'http://127.0.0.1:4178', changeOrigin: false } },
  },
  preview: {
    proxy: { '/operations-api': { target: 'http://127.0.0.1:4178', changeOrigin: false } },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
              includeDependenciesRecursively: false,
            },
            {
              name: 'math-vendor',
              test: /node_modules[\\/]katex[\\/]/,
              priority: 10,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  test: { environment: 'node', globals: true },
});
