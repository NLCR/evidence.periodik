import { useMutation, useQuery } from '@tanstack/react-query'
import {
  TTemplate,
  TTemplateItem,
  TemplateState,
} from '../components/prepare-scan-modal/schemas/schemas'
import { TVolumeDetail } from '../schema/volume'
import { api, queryClient } from './index'

const MOCK_TEMPLATE_ITEMS: TTemplateItem[] = [
  {
    specimen: {
      id: 'mock-specimen-1',
      number: '1',
      attachmentNumber: null,
      publicationDate: '2024-01-01',
      numExists: true,
      numMissing: false,
    },
    usePrimaryVolume: true,
    replacement: null,
    pageReplacements: [],
    note: undefined,
  },
  {
    specimen: {
      id: 'mock-specimen-2',
      number: '2',
      attachmentNumber: null,
      publicationDate: '2024-01-02',
      numExists: false,
      numMissing: true,
    },
    usePrimaryVolume: false,
    replacement: {
      volume: {
        id: null,
        signature: null,
        owner: null,
        barcode: null,
        mutation: null,
        mutationEdition: null,
      },
      pages: 'vsechny',
      isUnreplaceable: false,
      isWaitingForRescan: true,
    },
    pageReplacements: [],
    note: 'Mock replacement item',
  },
]

export const useVolumeTemplateQuery = (
  volumeId?: string,
  options: { enabled?: boolean } = {}
) =>
  useQuery<TTemplate | null>({
    queryKey: [`/volume/${volumeId}/template`],
    queryFn: async () => {
      // TODO: Zapojit realny endpoint `/volume/id/template` po finalizaci BE kontraktu.
      const detail = await api()
        .get(`volume/${volumeId}/detail`)
        .json<TVolumeDetail>()

      return {
        state: TemplateState.CREATED,
        primaryVolume: detail.volume,
        items: MOCK_TEMPLATE_ITEMS,
      }
    },
    enabled: (options.enabled ?? true) && !!volumeId,
  })

export const useSaveVolumeTemplateMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async (payload: TTemplate) => {
      if (!volumeId) return

      // TODO: Zapojit realny endpoint `/volume/id/template` po finalizaci BE kontraktu.
      // return api()
      //   .post(`volume/${volumeId}/template`, { json: payload })
      //   .json<void>()
      await Promise.resolve(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/volume/${volumeId}/template`],
      })
    },
  })
