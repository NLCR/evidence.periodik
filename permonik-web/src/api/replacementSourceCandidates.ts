import { useQuery } from '@tanstack/react-query'
import {
  TReplacementSource,
  TScanTemplateSettings,
} from '../components/prepare-scan-modal/schemas'
import { api } from './index'

export type TReplacementSourceCandidatesRequest = Pick<
  TScanTemplateSettings,
  'issues' | 'replacementSourcesParameters'
>

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
        .json<TReplacementSource[]>(),
  })
