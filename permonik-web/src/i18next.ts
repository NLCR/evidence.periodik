/*  eslint-disable import/no-named-as-default-member */
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import cs from './lang/cs/cs'
import sk from './lang/sk/sk'
import en from './lang/en/en'

export const supportedLanguages = ['cs', 'sk', 'en'] as const
export type TSupportedLanguages = (typeof supportedLanguages)[number]
export const defaultLang = 'cs'

export const defaultNS = 'global'
export const resources = {
  cs,
  sk,
  en,
} as const

export const changeAppLanguage = (lang: TSupportedLanguages) => {
  i18next.changeLanguage(lang).then(() => {
    const location = window.location.href
    const hasLang = /\/[a-z][a-z]\//.test(location)
    window.history.replaceState(
      null,
      '',
      hasLang ? location.replace(/\/[a-z][a-z]\//, `/${lang}/`) : `${lang}/`
    )
  })
}

i18next.use(LanguageDetector).use(initReactI18next)

if (!i18next.isInitialized) {
  i18next.init({
    ns: [defaultNS],
    fallbackLng: defaultLang,
    supportedLngs: supportedLanguages,
    // lng: userLanguage,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    defaultNS,
    resources,
    debug: false,
    detection: {
      order: ['path', 'cookie', 'localStorage', 'sessionStorage', 'navigator'],
    },
  })
}

export default i18next
