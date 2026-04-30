import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import { PlanDigitalizationResponse } from './schemas'
import { TMutationMark } from '@/utils/mutationMark'

export type PlanDigitalizationQueryParams = {
  yearFrom: string
  yearTo: string
  mutationId: string
  mutationalEdition: TMutationMark
}

export const usePlanDigitalizationQuery = (
  params: PlanDigitalizationQueryParams | null
) => {
  return useQuery({
    queryKey: ['plan-digitalization', 'overview', params],
    enabled: !!params,
    queryFn: () => {
      if (!params) {
        return Promise.resolve([] as PlanDigitalizationResponse)
      }

      return api()
        .get('plan-digitalization/overview', {
          searchParams: {
            yearFrom: params.yearFrom,
            yearTo: params.yearTo,
            mutationId: params.mutationId,
            mutationalEditionType: params.mutationalEdition.type ?? '',
            mutationalEditionMark: params.mutationalEdition.mark ?? '',
            mutationalEditionDescription:
              params.mutationalEdition.description ?? '',
          },
        })
        .json<PlanDigitalizationResponse>()
    },
  })
}
