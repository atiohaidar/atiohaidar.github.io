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
        historyApiFallback: true,
        proxy: {
          '/api': {
            target: 'http://localhost:8787',
            changeOrigin: true,
          },
          // WebSocket untuk chat dengan suffix -ws
          '/chat-ws': {
            target: 'ws://localhost:8787',
            ws: true,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/chat-ws/, '/chat'),
            configure: (proxy, options) => {
              proxy.on('error', (err, req, res) => {
                console.log('Chat WebSocket proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('Chat WebSocket request:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log('Chat WebSocket response:', proxyRes?.statusCode, req.url);
              });
            },
          },
          // Handle client-side routing untuk chat
          '^/chat/\\.*': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
          // WebSocket untuk whiteboard dengan path yang lebih spesifik
          '^/whiteboard-ws/(.+)': {
            target: 'ws://localhost:8787',
            ws: true,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/whiteboard-ws\//, '/whiteboard/'),
            configure: (proxy, options) => {
              proxy.on('error', (err, req, res) => {
                console.error('Whiteboard WebSocket proxy error:', err);
              });
              proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
                console.log('Whiteboard WebSocket connection established');
              });
            },
          },
          // Handle client-side routing untuk whiteboard
          '^/whiteboard/\\.*': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      }
    };
});
