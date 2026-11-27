import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import {
  type PlanDigitalizationFilters,
  PlanDigitalizationResponseSchema,
  PlanningFacetsSchema,
} from './schemas'

export const usePlanDigitalizationQuery = (
  params: PlanDigitalizationFilters | null
) => {
  return useQuery({
    queryKey: ['plan-digitalization', 'overview', params],
    enabled: !!params,
    queryFn: () =>
      api()
        .post('export/template-planning/query', { json: params })
        .json()
        .then((data) => PlanDigitalizationResponseSchema.parse(data)),
  })
}

export const usePlanningFacetsQuery = (
  params: PlanDigitalizationFilters | null
) =>
  useQuery({
    queryKey: ['plan-digitalization', 'facets', params],
    enabled: params !== null,
    staleTime: 30_000,
    retry: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryFn: ({ signal }) =>
      api()
        .post('export/template-planning/facets', {
          json: params,
          signal,
          timeout: 4000,
        })
        .json()
        .then((data) => PlanningFacetsSchema.parse(data)),
  })
