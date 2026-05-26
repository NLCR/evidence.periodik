import { type resources, type defaultNS } from '../i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['cs']
  }
}
