import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false,
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'phaser']
  },
  publicDir: 'public',
  base: '/',
  assetsInclude: ['**/*.mp3', '**/*.png', '**/*.jpg', '**/*.jpeg'],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.mp3')) {
            return 'assets/audio/[name][extname]';
          }
          if (assetInfo.name.match(/\.(png|jpg|jpeg)$/)) {
            return 'assets/images/[name][extname]';
          }
        }
      }
    }
  }
}); 