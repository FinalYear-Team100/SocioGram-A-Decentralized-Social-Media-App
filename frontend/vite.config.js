import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory for the build
    outDir: 'dist',
    // Generate source maps for debugging
    sourcemap: true,
  },
  // Configure base path - leave as '/' for deploying to root domain
  base: '/',
  // Configure server for development
  server: {
    port: 3000,
    open: true,
  },
  // Environment variable prefixes to expose to the client
  envPrefix: ['VITE_'],
});