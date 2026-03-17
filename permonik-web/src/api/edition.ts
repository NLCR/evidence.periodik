import { useMutation, useQuery } from '@tanstack/react-query'
import clone from 'lodash/clone'
import { api, queryClient } from './index'
import { TEditableEdition, TEdition } from '../schema/edition'

export const useEditionListQuery = () => {
  return useQuery({
    queryKey: ['edition', 'list', 'all'],
    queryFn: () => api().get(`edition/list/all`).json<TEdition[]>(),
  })
}

export const useUpdateEditionMutation = () =>
  useMutation({
    mutationFn: (edition: TEditableEdition) => {
      const editionClone = clone(edition)
      editionClone.name = {
        cs: editionClone.name.cs.trim(),
        sk: editionClone.name.sk.trim(),
        en: editionClone.name.en.trim(),
      }

      return api()
        .put(`edition/${editionClone.id}`, {
          json: editionClone,
        })
        .json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edition', 'list'] })
    },
  })

export const useCreateEditionMutation = () =>
  useMutation({
    mutationFn: (edition: TEditableEdition) => {
      const editionClone = clone(edition)
      editionClone.name = {
        cs: editionClone.name.cs.trim(),
        sk: editionClone.name.sk.trim(),
        en: editionClone.name.en.trim(),
      }

      return api()
        .post(`edition`, {
          json: editionClone,
        })
        .json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edition', 'list'] })
    },
  })
