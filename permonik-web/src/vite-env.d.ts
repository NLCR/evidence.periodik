/// <reference types="vite/client" />
/// <reference types="@welldone-software/why-did-you-render" />

interface ImportMetaEnv {
  readonly SENTRY_AUTH_TOKEN: string
  readonly SENTRY_ORG: string
  readonly SENTRY_PROJECT: string
  readonly SENTRY_URL: string
  readonly VITE_SENTRY_DNS: string
  readonly VITE_MUI_LICENCE_KEY: string
  readonly VITE_APP_TYPE: string
}
