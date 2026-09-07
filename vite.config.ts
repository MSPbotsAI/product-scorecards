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
    },
  },
  plugins: [
    react({
      app: {
        name: 'MSPbots AI',
        title: 'Product Team Scorecards',
      },
      // Platform Logto SSO (shared client, fixed callback). Local dev runs no OIDC: the backend's
      // ENV=dev mock user stands in, and the datasets are read in public mode (PUBLIC_API_KEY).
      auth: { mode: 'logto' },
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
