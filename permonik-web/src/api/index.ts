import ky, { HTTPError } from 'ky'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import i18next from '../i18next'
import { captureException, withScope } from '@sentry/react'

// Setup queryClient
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (err, _variables, _context, mutation) => {
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
    onError: (err, query) => {
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
  }
}

type BaseOptions = {
  handledCodes?: number[]
  throwErrorFromKy?: boolean
}

const baseApi = ({ handledCodes, throwErrorFromKy = true }: BaseOptions) =>
  ky.extend({
    timeout: 30000,
    // throw error into console
    throwHttpErrors: throwErrorFromKy,
    retry: 0,
    hooks: {
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
