import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const config = {
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'phaser']
  },
  publicDir: 'public',
  base: '/',
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
};

// Add build configuration separately
config.build = {
  outDir: 'dist',
  assetsDir: 'assets',
  sourcemap: true,
  cssCodeSplit: true,
  rollupOptions: {
    output: {
      manualChunks: undefined
    }
  }
};

export default defineConfig(config); 