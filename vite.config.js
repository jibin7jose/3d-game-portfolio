import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  optimizeDeps: {
    include: ['three']
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 10000
  },
  assetsInclude: ['**/*.glb', '**/*.gltf']
});
