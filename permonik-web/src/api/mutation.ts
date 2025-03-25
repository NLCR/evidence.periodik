import { useMutation, useQuery } from '@tanstack/react-query'
import clone from 'lodash/clone'
import { api, queryClient } from './index'
import { TEditableMutation, TMutation } from '../schema/mutation'

export const useMutationListQuery = () => {
  return useQuery({
    queryKey: ['mutation', 'list', 'all'],
    queryFn: () => api().get(`mutation/list/all`).json<TMutation[]>(),
  })
}

export const useUpdateMutationMutation = () =>
  useMutation({
    mutationFn: (mutation: TEditableMutation) => {
      const mutationClone = clone(mutation)
      mutationClone.name = {
        cs: mutationClone.name.cs.trim(),
        sk: mutationClone.name.sk.trim(),
        en: mutationClone.name.en.trim(),
      }

      return api()
        .put(`mutation/${mutationClone.id}`, {
          // JSON.stringify name, because solr stores name as String
          json: {
            ...mutationClone,
            name: JSON.stringify(mutationClone.name),
          },
        })
        .json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mutation', 'list'] })
    },
  })

export const useCreateMutationMutation = () =>
  useMutation({
    mutationFn: (mutation: TEditableMutation) => {
      const mutationClone = clone(mutation)
      mutationClone.name = {
        cs: mutationClone.name.cs.trim(),
        sk: mutationClone.name.sk.trim(),
        en: mutationClone.name.en.trim(),
      }

      return api()
        .post(`mutation`, {
          // JSON.stringify name, because solr stores name as String
          json: {
            ...mutationClone,
            name: JSON.stringify(mutationClone.name),
          },
        })
        .json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mutation', 'list'] })
    },
  })
