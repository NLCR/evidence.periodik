import { useMutation, useQuery } from '@tanstack/react-query'
import clone from 'lodash/clone'
import { api, queryClient } from './index'
import { MeSchema, type TBasicLogin, type TMe, type TUser } from '@/schema/user'
// import { APP_WITH_EDITING_ENABLED } from '../utils/constants'

// const { MODE } = import.meta.env

export const useMeQuery = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<TMe | null> => {
      const body = await api()
        .get(`me`, { headers: { Accept: 'application/json' } })
        .text()
      return body ? MeSchema.parse(JSON.parse(body)) : null
    },
  })
}

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: () => {
      return api({ throwErrorFromKy: false }).post(`auth/logout`, {
        redirect: 'manual',
      })
    },
  })

export const useBasicLoginMutation = () =>
  useMutation({
    mutationFn: (payload: TBasicLogin) => {
      return api({ throwErrorFromKy: false }).post(`auth/login/basic`, {
        json: payload,
      })
    },
    onSuccess: (response) => {
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['me'] })
      }
    },
  })

export const useUpdateUserMutation = (me: TMe) =>
  useMutation({
    mutationFn: (user: TUser) => {
      const userClone = clone(user)
      userClone.email = user.email.trim()
      userClone.userName = user.userName.trim()
      userClone.firstName = user.firstName.trim()
      userClone.lastName = user.lastName.trim()

      return api().put(`user/${userClone.id}`, { json: userClone }).json<void>()
    },
    onSuccess: (_, editArgs) => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      if (editArgs.id === me.id) {
        queryClient.invalidateQueries({ queryKey: ['me'] })
      }
    },
  })

export const useUserListQuery = () =>
  useQuery({
    queryKey: ['user', 'list', 'all'],
    queryFn: () => api().get(`user/list/all`).json<TUser[]>(),
  })
