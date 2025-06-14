import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // externalize node-only packages to prevent Vite from bundling them in frontend code
      external: ['dmg-license', 'electron-builder'],
    },
  },
  optimizeDeps: {
    // exclude these from dependency pre-bundling (speed optimization)
    exclude: ['dmg-license', 'electron-builder'],
  },
  base: './',
});
