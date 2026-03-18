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
  useQuery<TReplacementSource[]>({
    queryKey: [
      'replacement-source-candidates',
      payload.issues,
      payload.replacementSourcesParameters,
    ],
    queryFn: () => [
      {
        id: '1',
        signature: 'sig1-45-asd',
        barcode: '123456789',
        owner: 'NKP',
        mutation: 'Praha',
        mutationEdition: '***',
      },
      {
        id: '2',
        signature: 'sig2-41-afd',
        barcode: '234567891',
        owner: 'MZK',
        mutation: 'Praha',
        mutationEdition: '*',
      },
      {
        id: '3',
        signature: 's3asc-10afs',
        barcode: '3456778912',
        owner: 'Praha',
        mutation: 'Brno',
        mutationEdition: '**',
      },
    ], // TODO: Zapojit realny endpoint
    // api()
    //   .post(`volume/${id}/replacement-source-candidates`, {
    //     json: payload,
    //   })
    //   .json<TReplacementSource[]>(),
  })
