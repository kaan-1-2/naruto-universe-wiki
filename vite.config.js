import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Local development proxy: requests remain same-origin in the browser.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/data/')) return 'archive-data';
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/naruto': {
        target: 'https://dattebayo-api.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/naruto/, ''),
      },
    },
  },
});
