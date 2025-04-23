import { useMutation, useQuery } from '@tanstack/react-query'
import clone from 'lodash/clone'
import { api, queryClient } from './index'
import { TMetaTitle, TEditableMetaTitle } from '../schema/metaTitle'
import { TSpecimensPublicationDays } from '../schema/specimen'

export const useMetaTitleQuery = (metaTitleId?: string) =>
  useQuery({
    queryKey: ['metatitle', metaTitleId],
    queryFn: () => api().get(`metatitle/${metaTitleId}`).json<TMetaTitle>(),
    enabled: !!metaTitleId,
  })

interface TMetaTitleOverview {
  id: string
  name: string
  specimens: {
    mutationsCount: number
    ownersCount: number
    // groupedSpecimens: number
    matchedSpecimens: number
  } & TSpecimensPublicationDays
}

export const useMetaTitleOverviewListQuery = () =>
  useQuery({
    queryKey: ['metatitle', 'list', 'overview'],
    queryFn: () =>
      api().get('metatitle/list/overview').json<TMetaTitleOverview[]>(),
  })

export const useMetaTitleListQuery = () =>
  useQuery({
    queryKey: ['metatitle', 'list', 'all'],
    queryFn: () => api().get('metatitle/list/all').json<TMetaTitle[]>(),
  })

export const useUpdateMetaTitleMutation = () =>
  useMutation({
    mutationFn: (metaTitle: TEditableMetaTitle) => {
      const metaTitleClone = clone(metaTitle)
      metaTitleClone.name = metaTitleClone.name.trim()
      metaTitleClone.note = metaTitleClone.note.trim()

      return api()
        .put(`metatitle/${metaTitleClone.id}`, { json: metaTitleClone })
        .json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metatitle', 'list'] })
    },
  })

export const useCreateMetaTitleMutation = () =>
  useMutation({
    mutationFn: (metaTitle: TEditableMetaTitle) => {
      const metaTitleClone = clone(metaTitle)
      metaTitleClone.name = metaTitleClone.name.trim()
      metaTitleClone.note = metaTitleClone.note.trim()

      return api().post(`metatitle`, { json: metaTitleClone }).json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metatitle', 'list'] })
    },
  })
