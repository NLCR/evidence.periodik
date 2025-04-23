import './wdyr'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  setTag,
  init as SentryInit,
  browserTracingIntegration,
  extraErrorDataIntegration,
} from '@sentry/react'
import { ToastContainer } from 'react-toastify'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import i18next from './i18next'
import { queryClient } from './api'
import App from './App'
import theme from './theme'
import './styles.css'
import { LicenseInfo } from '@mui/x-license'

const { MODE, VITE_SENTRY_DNS, VITE_MUI_LICENCE_KEY } = import.meta.env

const getEnvironment = () => {
  let environment = 'unknown'
  const hostname = window.location.hostname

  if (hostname.includes('permonik')) {
    environment = 'prod'
  }
  if (hostname.includes('permonik-test')) {
    environment = 'test'
  }
  if (hostname.includes('localhost')) {
    environment = 'localhost'
  }

  return environment
}

// Setup Sentry for errors reporting in production
setTag('APP_TYPE', MODE) // public or admin
SentryInit({
  dsn: VITE_SENTRY_DNS,
  tracePropagationTargets: ['permonik.nkp.cz', 'permonik-test.nkp.cz', /^\//],
  integrations: [browserTracingIntegration(), extraErrorDataIntegration()],
  tracesSampleRate: 0.5,
  environment: getEnvironment(),
  beforeSend(event) {
    return getEnvironment() === 'localhost' ? null : event
  },
})

LicenseInfo.setLicenseKey(VITE_MUI_LICENCE_KEY)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </I18nextProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
    <ToastContainer
      position="bottom-left"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </React.StrictMode>
)
