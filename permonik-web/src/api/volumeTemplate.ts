import { useMutation, useQuery } from '@tanstack/react-query'
import { TTemplate } from '../components/prepare-scan-modal/schemas/schemas'
import { queryClient } from './index'

export const useVolumeTemplateQuery = (
  volumeId?: string,
  options: { enabled?: boolean } = {}
) =>
  useQuery<TTemplate | null>({
    queryKey: [`/volume/${volumeId}/template`],
    queryFn: async () => {
      // TODO: Zapojit realny endpoint `/volume/id/template` po finalizaci BE kontraktu.
      return null
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
