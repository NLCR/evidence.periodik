import ky, { HTTPError } from 'ky'
import Cookies from 'js-cookie'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import i18next from '../i18next'
import { captureException, withScope } from '@sentry/react'

// Setup queryClient
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (err: unknown, _variables, _context, mutation) => {
      if (err instanceof HTTPError && err.response.status === 403) {
        return
      }

      withScope((scope) => {
        scope.setContext('mutation', {
          mutationId: mutation.mutationId,
          variables: mutation.state.variables,
        })
        if (mutation.options.mutationKey) {
          scope.setFingerprint(
            Array.from(mutation.options.mutationKey) as string[]
          )
        }
        captureException(err)
      })
    },
  }),
  queryCache: new QueryCache({
    onError: (err: unknown, query) => {
      if (err instanceof HTTPError && err.response.status === 403) {
        return
      }

      withScope((scope) => {
        scope.setContext('query', { queryHash: query.queryHash })
        scope.setFingerprint([query.queryHash.replaceAll(/[0-9]/g, '0')])
        captureException(err)
      })
    },
  }),
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      // staleTime: 5000
    },
  },
})

interface SpringError {
  timestamp: string
  status: number
  error: string
  exception: string
  message: string
  path: string
}

const processError = (error: SpringError) => {
  if (error.status === 403) {
    toast.warn(i18next.t('common.session_expired'))

    // queryClient.invalidateQueries({ queryKey: ['me'] })
  } else if (error.status === 500) {
    toast.error(`${error.status}: ${error.message}`)
  } else if (
    error.status === 422 &&
    error.message === 'VOLUME_DATE_RANGE_EXCLUDES_ACTIVE_SPECIMEN'
  ) {
    toast.error(
      i18next.t('volume_overview.date_range_excludes_active_specimen')
    )
  }
}

type BaseOptions = {
  handledCodes?: number[]
  throwErrorFromKy?: boolean
}

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])

const getCsrfToken = async () => {
  let token = Cookies.get('XSRF-TOKEN')
  if (token) return token

  const response = await fetch('/api/auth/csrf', {
    credentials: 'same-origin',
    headers: {
      'Accept-Language': i18next.resolvedLanguage ?? i18next.language ?? 'cs',
    },
  })
  if (!response.ok) throw new Error('Could not initialize CSRF protection')

  token = Cookies.get('XSRF-TOKEN')
  if (!token) throw new Error('CSRF token cookie was not created')
  return token
}

const baseApi = ({ handledCodes, throwErrorFromKy = true }: BaseOptions) =>
  ky.extend({
    timeout: 30000,
    // throw error into console
    throwHttpErrors: throwErrorFromKy,
    retry: 0,
    hooks: {
      beforeRequest: [
        async (request) => {
          request.headers.set(
            'Accept-Language',
            i18next.resolvedLanguage ?? i18next.language ?? 'cs'
          )
          if (!SAFE_HTTP_METHODS.has(request.method.toUpperCase())) {
            request.headers.set('X-XSRF-TOKEN', await getCsrfToken())
          }
        },
      ],
      afterResponse: [
        // Handle errors
        async (_request, _options, response) => {
          if (response.ok) return

          if (handledCodes?.find((c) => c === response.status)) {
            // No response with an error will be passed into react-query -> cannot use onError function
            return
          }

          try {
            const error = await response.json<SpringError>()
            processError(error)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            /* empty */
          }
        },
      ],
    },
  })

// Used for fetching data with React Query
export const api = ({ ...base }: BaseOptions = {}) =>
  baseApi(base).extend({
    prefixUrl: '/api',
  })
