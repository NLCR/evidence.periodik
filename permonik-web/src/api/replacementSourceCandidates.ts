import { useQuery } from '@tanstack/react-query'
import { TScanTemplateSettings } from '../components/prepare-scan-modal/schemas'
import { api } from './index'

export type TReplacementSourceCandidatesRequest = Pick<
  TScanTemplateSettings,
  'issues' | 'replacementSourcesParameters'
>

export type TReplacementSourceCandidate = {
  id: string
  signature: string
  barcode: string
  owner: string
  mutation: string
  mutationEdition: string
}

export const useReplacementSourceCandidatesQuery = (
  payload: TReplacementSourceCandidatesRequest
) =>
  useQuery({
    queryKey: [
      'replacement-source-candidates',
      payload.issues,
      payload.replacementSourcesParameters,
    ],
    queryFn: () =>
      api()
        .post('replacement-source/candidates', {
          json: payload,
        })
        .json<TReplacementSourceCandidate[]>(),
  })
