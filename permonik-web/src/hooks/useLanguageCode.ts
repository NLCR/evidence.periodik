import { useTranslation } from 'react-i18next'
import { type TSupportedLanguages } from '../i18next'

export const useLanguageCode = () => {
  const { i18n } = useTranslation()
  return { languageCode: i18n.resolvedLanguage as TSupportedLanguages }
}
