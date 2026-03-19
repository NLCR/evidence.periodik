import { useQuery } from '@tanstack/react-query'
import {
  defaultScanSettings,
  TScanTemplateSettings,
} from '../components/prepare-scan-modal/schemas/schemas'

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
