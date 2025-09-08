import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts')) return 'echarts';
            if (id.includes('echarts-for-react')) return 'echarts';
            if (id.includes('@mui')) return 'mui';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('dayjs')) return 'dayjs';
          }
        },
      },
    },
  },
});
