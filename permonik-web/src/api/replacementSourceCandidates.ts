import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  type TReplacementSource,
  type TScanTemplateSettings,
} from '../components/prepare-scan-modal/schemas/schemas'
import { api } from './index'

export type TReplacementSourceCandidatesRequest = Pick<
  TScanTemplateSettings,
  'issues' | 'replacementSourcesParameters' | 'replacementSources'
>

export const useReplacementSourceCandidatesQuery = (
  volumeId: string,
  payload: TReplacementSourceCandidatesRequest
) =>
  useQuery<TReplacementSource[]>({
    queryKey: [
      'replacement-source-candidates',
      volumeId,
      payload.issues,
      payload.replacementSourcesParameters,
      payload.replacementSources.map((source) => source.volumeId ?? null),
    ],
    queryFn: () =>
      api()
        .post(`export/volume/${volumeId}/template/replacement-candidates`, {
          json: payload,
        })
        .json<TReplacementSource[]>(),
    enabled: !!volumeId,
    placeholderData: keepPreviousData,
  })
