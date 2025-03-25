import { useMutation, useQuery } from '@tanstack/react-query'
import clone from 'lodash/clone'
import { api, queryClient } from './index'
import { TEditableOwner, TOwner } from '../schema/owner'
import ky from 'ky'

export const useOwnerListQuery = () => {
  return useQuery({
    queryKey: ['owner', 'list', 'all'],
    queryFn: () => api().get(`owner/list/all`).json<TOwner[]>(),
  })
}

export const useUpdateOwnerMutation = () =>
  useMutation({
    mutationFn: (owner: TEditableOwner) => {
      const ownerClone = clone(owner)
      ownerClone.name = ownerClone.name.trim()
      ownerClone.shorthand = ownerClone.shorthand.trim()
      ownerClone.sigla = ownerClone.sigla.trim()

      return api()
        .put(`owner/${ownerClone.id}`, { json: ownerClone })
        .json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'list'] })
    },
  })

export const useCreateOwnerMutation = () =>
  useMutation({
    mutationFn: (owner: TEditableOwner) => {
      const ownerClone = clone(owner)
      ownerClone.name = ownerClone.name.trim()
      ownerClone.shorthand = ownerClone.shorthand.trim()
      ownerClone.sigla = ownerClone.sigla.trim()

      return api().post(`owner`, { json: ownerClone }).json<void>()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'list'] })
    },
  })

type TSiglaList = {
  resultCount: number
  records?: { sigla: string; id: string; title: string; urls: string[] }[]
  status: 'OK'
}

export type TSiglaListError = {
  status: 'ERROR'
  statusMessage: string
}

export const useGetSiglaListMutation = () => {
  return useMutation<TSiglaList, TSiglaListError, string>({
    mutationFn: (sigla) =>
      ky(
        `https://www.knihovny.cz/api/v1/libraries/search?lookfor=${sigla}&type=Sigla&sort=relevance&page=1&limit=20&prettyPrint=false&lng=cs`
      ).json(),
  })
}
