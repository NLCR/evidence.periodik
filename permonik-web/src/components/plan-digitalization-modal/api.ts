import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import {
  type PlanDigitalizationFilters,
  type PlanDigitalizationResponse,
} from './schemas'

export const usePlanDigitalizationQuery = (
  params: PlanDigitalizationFilters | null
) => {
  return useQuery({
    queryKey: ['plan-digitalization', 'overview', params],
    enabled: !!params,
    queryFn: () =>
      api()
        .post('template-planning/query', { json: params })
        .json<PlanDigitalizationResponse>(),
  })
}
