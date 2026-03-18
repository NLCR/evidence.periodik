import { useQuery } from '@tanstack/react-query'
import { TTemplateIssues } from '../components/prepare-scan-modal/schemas'

type TCalculateFillIndexRequest = {
  issues: TTemplateIssues
  replacementSourcesIds: string[]
}

export const useCalculatedFillIndexQuery = (
  volumeId: string | undefined,
  payload: TCalculateFillIndexRequest
) =>
  useQuery<number>({
    queryKey: ['volume-calculated-fill-index', volumeId, payload],
    queryFn: async () => {
      // TODO: Odkomentovat realny API call po priprave backend endpointu.
      return Math.floor(Math.random() * (100000 - 90000 + 1)) + 90000

      // return api()
      //   .post(`volume/${volumeId}/template/calculate-fill-index`, {
      //     json: payload,
      //   })
      //   .json<number>()
    },
    enabled: !!volumeId,
  })
