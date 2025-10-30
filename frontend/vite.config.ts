import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        host: true,
        port: 3000,
        proxy: {
          '/api': {
            target: 'http://localhost:8787',
            changeOrigin: true,
          },
          '/chat': {
            target: 'http://localhost:8787',
            ws: true,
            changeOrigin: true,
            configure: (proxy, options) => {
              proxy.on('error', (err, req, res) => {
                console.log('WebSocket proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('WebSocket proxy request:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log('WebSocket proxy response:', proxyRes.statusCode, req.url);
              });
            },
          },
          '/whiteboard': {
            target: 'http://localhost:8787',
            ws: true,
            changeOrigin: true,
            configure: (proxy, options) => {
              proxy.on('error', (err, req, res) => {
                console.log('Whiteboard WebSocket proxy error', err);
              });
            },
          },
        },
      }
    };
});
