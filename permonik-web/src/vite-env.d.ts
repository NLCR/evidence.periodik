/// <reference types="vite/client" />
/// <reference types="@welldone-software/why-did-you-render" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENVIRONMENT: string
  readonly VITE_SENTRY_RELEASE: string
  readonly VITE_MUI_LICENCE_KEY: string
  readonly VITE_APP_TYPE: string
}
