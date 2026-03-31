import { type resources, type defaultNS } from '../i18next'

declare module 'i18next' {
  // eslint-disable-next-line no-unused-vars
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['cs']
  }
}
