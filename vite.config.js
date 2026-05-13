import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built bundle works both when served from a path
// (GitHub Pages) and when opened directly from the file system.
export default defineConfig({
  plugins: [react()],
  base: './',
});
