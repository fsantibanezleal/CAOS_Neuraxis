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
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 20, includeDependenciesRecursively: false },
            { name: 'math-vendor', test: /node_modules[\\/]katex[\\/]/, priority: 10, includeDependenciesRecursively: false },
          ],
        },
      },
    },
  },
  test: { environment: 'node', globals: true },
});
