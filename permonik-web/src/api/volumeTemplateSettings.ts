import { useMutation, useQuery } from '@tanstack/react-query'
import {
  defaultScanSettings,
  TScanTemplateSettings,
} from '../components/prepare-scan-modal/schemas/schemas'
import { queryClient } from './index'

export const useVolumeTemplateSettingsQuery = (volumeId?: string) =>
  useQuery<TScanTemplateSettings | null>({
    queryKey: [`/volume/${volumeId}/template/settings`],
    queryFn: async () => {
      // TODO: Zapojit realny endpoint `/volume/id/template/settings` po finalizaci BE kontraktu.
      // Do te doby vracime fallback na `defaultScanSettings`.
      return defaultScanSettings
    },
    enabled: !!volumeId,
  })

export const useSaveVolumeTemplateSettingsMutation = (volumeId?: string) =>
  useMutation({
    mutationFn: async (payload: TScanTemplateSettings) => {
      if (!volumeId) return

      // TODO: Zapojit realny endpoint `/volume/id/template/settings` po finalizaci BE kontraktu.
      // return api()
      //   .post(`volume/${volumeId}/template/settings`, { json: payload })
      //   .json<void>()
      await Promise.resolve(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/volume/${volumeId}/template/settings`],
      })
    },
  })
