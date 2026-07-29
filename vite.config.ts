import { defineConfig } from 'vite'
import react from '@mspbots/react'
import tailwindcss from '@tailwindcss/vite'

const port = process.env.PORT

export default defineConfig({
  base: process.env.BASE_URL,
  server: {
    open: false,
    proxy: {
      '^/(api|ws|sse)': { target: `http://127.0.0.1:${port}`, changeOrigin: true, ws: true },
      // The plugin's own dev proxy sends this to agentint (the int env). The scorecard's datasets
      // live in production, and an int token cannot read them — so the login round-trip is pointed
      // at production instead, and its cookie is rewritten onto localhost.
      '^/apps/mb-platform-user': {
        target: 'https://app.mspbots.ai',
        changeOrigin: true,
        cookieDomainRewrite: '',
      },
    }
  },
  plugins: [
    react({
      app: {
        name: 'MSPbots AI',
        title: 'Product Team Scorecards',
      },
      // Enabled so local dev can obtain a real token: $fetch has nothing to attach otherwise.
      // Same reason as the proxy above — dev logs in against production, not agentint.
      auth: {
        enabled: true,
        target: ({ dev }) =>
          dev ? 'https://app.mspbots.ai/apps/mb-platform-user/login' : '/apps/mb-platform-user/login',
      },
      layout: {
        sidebar: {
          account: true,
        },
      },
    }),
    tailwindcss(),
  ],

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
  },

  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
  },
})
