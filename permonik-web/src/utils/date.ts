import dayjs, { Dayjs } from 'dayjs'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const DATE_FORMATS = {
  cs: 'DD. MM. YYYY',
  en: 'YYYY-MM-DD',
  sk: 'DD. MM. YYYY',
}

type Locale = keyof typeof DATE_FORMATS

export function useFormatDate() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'cs'

  const formatDate = useCallback(
    (
      value: string | Dayjs | null | undefined,
      options?: {
        includeDayName?: boolean
        fullDayName?: boolean
        includeTime?: boolean
      }
    ) => {
      if (
        !value ||
        (typeof value === 'string' && value.length === 0) ||
        (dayjs.isDayjs(value) && !value.isValid())
      )
        return '-'

      const format =
        (options?.includeDayName
          ? options?.fullDayName
            ? 'dddd '
            : 'dd '
          : '') +
        DATE_FORMATS[locale as Locale] +
        (options?.includeTime ? ' HH:mm:ss' : '')

      return dayjs(value).locale(locale).format(format)
    },
    [locale]
  )

  return {
    formatDate,
  }
}
