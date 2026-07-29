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
      // Off: production's login app cannot hand a session to localhost anyway (no providers on
      // /login, no /sign-in route), and local dev reads data in public mode (PUBLIC_API_KEY), which
      // needs no user. On-platform deploys get their session from the platform shell regardless.
      auth: false,
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
