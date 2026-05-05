import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /auth and /leads to the NestJS backend during dev
      '/auth': 'http://localhost:3000',
      '/leads': 'http://localhost:3000',
    },
  },
});
