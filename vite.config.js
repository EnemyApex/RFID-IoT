// ============================================================
// FICHIER : vite.config.js
// RÔLE   : Configure le build React (Vite) et le proxy de dev.
// USAGE  : En local, redirige /api vers le backend Vercel.
// ============================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // En développement : proxy vers Vercel dev (port 3000)
    proxy: { '/api': 'http://localhost:3000' }
  }
});
