/// <reference types="vite/client" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslintPlugin from 'vite-plugin-eslint'
import { sentryVitePlugin } from '@sentry/vite-plugin'
// import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  process.env = { ...process.env, ...env }

  return {
    plugins: [
      react({ jsxImportSource: '@welldone-software/why-did-you-render' }),
      eslintPlugin(),
      sentryVitePlugin({
        url: process.env.SENTRY_URL,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        release: {
          create: !!process.env.SENTRY_DEPLOY_ENV,
          deploy: {
            env: process.env.SENTRY_DEPLOY_ENV || 'Not specified',
          },
          setCommits: {
            auto: true,
            ignoreMissing: true,
          },
        },
        // telemetry: false,
        // debug: true,
      }),
      // visualizer({
      //   template: 'treemap', // or sunburst
      //   open: false,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'analyse.html', // will be saved in project's root
      // }),
    ],
    build: {
      // required for sentry: tells vite to create source maps
      sourcemap: true,
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080/',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
