import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createDefaultScanSettings,
  TScanTemplateSettings,
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
    mainScan: { type: 'PRIMARY', locked: false, visible: true },
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
    mainScan: {
      type: 'REPLACEMENT',
      locked: false,
      visible: true,
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
    },
    pageReplacements: [],
    note: 'Mock replacement item',
  },
]

export const usePrepareScanTemplateQuery = (
  volumeId?: string,
  options: { enabled?: boolean } = {}
) =>
  useQuery<TTemplate | null>({
    queryKey: [`/volume/${volumeId}/template`],
    queryFn: async () => {
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

export const useSavePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async (payload: TTemplate) => {
      if (!volumeId) return
      await Promise.resolve(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/volume/${volumeId}/template`],
      })
    },
  })

export const useUpdatePrepareScanTemplateStateMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async (state: TemplateState) => {
      if (!volumeId) return
      await Promise.resolve({ status: 200, state })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/volume/${volumeId}/template`],
      })
    },
  })

export const usePrepareScanTemplateSettingsQuery = (volumeId?: string) =>
  useQuery<TScanTemplateSettings | null>({
    queryKey: [`/volume/${volumeId}/template/settings`],
    queryFn: async () => createDefaultScanSettings(),
    enabled: !!volumeId,
  })

export const useSavePrepareScanTemplateSettingsMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async (payload: TScanTemplateSettings) => {
      if (!volumeId) return
      await Promise.resolve(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/volume/${volumeId}/template/settings`],
      })
    },
  })

type TSynchronizeVolumePayload = {
  state: TemplateState
}

export const useSynchronizePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async ({ state }: TSynchronizeVolumePayload) => {
      if (!volumeId) return
      // TODO: zapojit BE endpoint pro synchronizaci template z volume
      await Promise.resolve({ volumeId, state, synchronized: true })
    },
  })

export const useDeletePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async () => {
      if (!volumeId) return
      // TODO: zapojit BE endpoint pro smazani template
      await Promise.resolve({ volumeId, deleted: true })
    },
  })
