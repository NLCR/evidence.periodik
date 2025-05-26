import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers-pro'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import RoutesManager from './components/RoutesManager'
import 'dayjs/locale/cs'
import 'dayjs/locale/sk'
import 'dayjs/locale/en'
import { APP_WITH_EDITING_ENABLED } from './utils/constants'
// import Footer from './components/Footer'

const App = () => {
  const { t, i18n } = useTranslation()

  dayjs.extend(localizedFormat)
  dayjs.extend(weekday)
  dayjs.extend(localeData)
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.tz.setDefault('Europe/Prague')
  dayjs.locale(i18n.resolvedLanguage)

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={i18n.resolvedLanguage}
    >
      <HelmetProvider>
        <Helmet>
          <title>
            {APP_WITH_EDITING_ENABLED
              ? t('helmet.title_admin')
              : t('helmet.title')}
          </title>
        </Helmet>
        <RoutesManager />
      </HelmetProvider>
    </LocalizationProvider>
  )
}

export default App
