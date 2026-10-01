import { useMutation, useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import {
  type TScanTemplateSettings,
  type TTemplate,
  type TemplateState,
} from '../components/prepare-scan-modal/schemas/schemas'
import { api, queryClient } from './index'

const templateQueryKey = (volumeId?: string) => ['volume', volumeId, 'template']

const requireVolumeId = (volumeId?: string) => {
  if (!volumeId) throw new Error('Volume ID is required')
  return volumeId
}

export const withVisible = (
  template: TTemplate,
  previous?: TTemplate | null
) => ({
  ...template,
  items: template.items.map((item) => {
    const previousItem = previous?.items.find(
      (current) => current.specimen.id === item.specimen.id
    )

    return {
      ...item,
      mainScan: {
        ...item.mainScan,
        visible: previousItem?.mainScan.visible ?? true,
      },
      pageReplacements: item.pageReplacements.map((replacement) => {
        const previousReplacement = previousItem?.pageReplacements.find(
          (current) =>
            current.pages.length === replacement.pages.length &&
            current.pages.every(
              (pageNumber, index) => pageNumber === replacement.pages[index]
            )
        )

        return {
          ...replacement,
          visible: previousReplacement?.visible ?? true,
        }
      }),
    }
  }),
})

export const usePrepareScanTemplateQuery = (
  volumeId?: string,
  options: { enabled?: boolean } = {}
) =>
  useQuery<TTemplate | null>({
    queryKey: templateQueryKey(volumeId),
    queryFn: async () => {
      const id = requireVolumeId(volumeId)
      try {
        return withVisible(
          await api().get(`export/volume/${id}/template`).json<TTemplate>(),
          queryClient.getQueryData<TTemplate>(templateQueryKey(id))
        )
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 404)
          return null
        throw error
      }
    },
    enabled: (options.enabled ?? true) && !!volumeId,
  })

export const useGeneratePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation<
    TTemplate,
    unknown,
    TScanTemplateSettings & {
      version: number | null
      previousTemplate?: TTemplate
    }
  >({
    mutationFn: async ({ previousTemplate, ...settings }) => {
      const id = requireVolumeId(volumeId)
      const template = await api()
        .post(`export/volume/${id}/template/generate`, { json: settings })
        .json<TTemplate>()
      return withVisible(
        template,
        previousTemplate ??
          queryClient.getQueryData<TTemplate>(templateQueryKey(id))
      )
    },
    onSuccess: (template) =>
      queryClient.setQueryData(
        templateQueryKey(requireVolumeId(volumeId)),
        template
      ),
  })

export const useSavePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation<TTemplate, unknown, TTemplate>({
    mutationFn: async (template) => {
      const id = requireVolumeId(volumeId)
      const response = await api()
        .put(`export/volume/${id}/template`, { json: template })
        .json<TTemplate>()
      return withVisible(response, template)
    },
    onSuccess: (template) =>
      queryClient.setQueryData(
        templateQueryKey(requireVolumeId(volumeId)),
        template
      ),
  })

export const useTransitionPrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation<
    TTemplate,
    unknown,
    { template: TTemplate; targetState: TemplateState }
  >({
    mutationFn: async ({ template, targetState }) => {
      const id = requireVolumeId(volumeId)
      const { version, ...changes } = template
      if (version === null) throw new Error('Template version is required')
      const response = await api()
        .post(`export/volume/${id}/template/transition`, {
          json: { targetState, version, changes },
        })
        .json<TTemplate>()
      return withVisible(response, template)
    },
    onSuccess: (template) =>
      queryClient.setQueryData(
        templateQueryKey(requireVolumeId(volumeId)),
        template
      ),
  })

export const useSynchronizePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation<TTemplate, unknown, { version: number }>({
    mutationFn: async ({ version }) => {
      const id = requireVolumeId(volumeId)
      const template = await api()
        .post(`export/volume/${id}/template/synchronize`, {
          json: { version },
        })
        .json<TTemplate>()
      return withVisible(
        template,
        queryClient.getQueryData<TTemplate>(templateQueryKey(id))
      )
    },
    onSuccess: (template) =>
      queryClient.setQueryData(
        templateQueryKey(requireVolumeId(volumeId)),
        template
      ),
  })

export const useDeletePrepareScanTemplateMutation = (volumeId?: string) =>
  useMutation<void, unknown, void>({
    mutationFn: async () => {
      await api().delete(`export/volume/${requireVolumeId(volumeId)}/template`)
    },
    onSuccess: () =>
      queryClient.removeQueries({
        queryKey: templateQueryKey(requireVolumeId(volumeId)),
        exact: true,
      }),
  })
