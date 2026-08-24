import { useQuery } from '@tanstack/react-query'
// import { api } from '../../api'
import {
  type PlanDigitalizationFilters,
  type PlanDigitalizationResponse,
} from './schemas'

const MOCK_PLAN_DIGITALIZATION_RESPONSE: PlanDigitalizationResponse = [
  {
    year: '1898',
    libraries: [
      {
        id: 'nk-cr',
        shorthand: 'NK ČR',
        volumes: [
          { id: 'volume-1898-1', number: '1', fillIndex: 92 },
          { id: 'volume-1898-2', number: '2', fillIndex: 64 },
        ],
      },
      {
        id: 'mzk',
        shorthand: 'MZK',
        volumes: [{ id: 'volume-1898-3', number: '1', fillIndex: 38 }],
      },
    ],
  },
  {
    year: '1899',
    libraries: [
      {
        id: 'nk-cr',
        shorthand: 'NK ČR',
        volumes: [{ id: 'volume-1899-1', number: '1', fillIndex: 75 }],
      },
      {
        id: 'svkpk',
        shorthand: 'SVK PK',
        volumes: [
          { id: 'volume-1899-2', number: '1', fillIndex: 18 },
          { id: 'volume-1899-3', number: '2', fillIndex: 100 },
        ],
      },
    ],
  },
  {
    year: '1900',
    libraries: [
      {
        id: 'mzk',
        shorthand: 'MZK',
        volumes: [{ id: 'volume-1900-1', number: '1', fillIndex: 47 }],
      },
      {
        id: 'svkpk',
        shorthand: 'SVK PK',
        volumes: [],
      },
    ],
  },
]

export const usePlanDigitalizationQuery = (
  params: PlanDigitalizationFilters | null
) => {
  return useQuery({
    queryKey: ['plan-digitalization', 'overview', params],
    enabled: !!params,
    queryFn: () => {
      if (!params) {
        return Promise.resolve([] as PlanDigitalizationResponse)
      }

      // TODO: Temporary mock until the plan digitalization backend exists.
      // return api()
      //   .post('plan-digitalization', {
      //     body: JSON.stringify(params),
      //   })
      //   .json<PlanDigitalizationResponse>()
      return Promise.resolve(MOCK_PLAN_DIGITALIZATION_RESPONSE)
    },
  })
}
