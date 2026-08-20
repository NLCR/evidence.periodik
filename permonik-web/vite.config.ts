/// <reference types="vite/client" />
import { defineConfig, loadEnv } from 'vite'
import checker from 'vite-plugin-checker'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
// import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  process.env = { ...process.env, ...env }

  return {
    plugins: [
      react({ jsxImportSource: '@welldone-software/why-did-you-render' }),
      babel({
        presets: [reactCompilerPreset()],
      }),
      checker({
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
        overlay: {
          initialIsOpen: false,
        },
      }),
      sentryVitePlugin({
        url: process.env.SENTRY_URL,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'inqool',
        project: 'permonik-frontend',
        release: {
          create: !!process.env.SENTRY_ENVIRONMENT,
          deploy: {
            env: process.env.SENTRY_ENVIRONMENT || 'Not specified',
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
