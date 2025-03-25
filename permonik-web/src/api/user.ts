import { useMutation, useQuery } from '@tanstack/react-query'
import clone from 'lodash/clone'
import { api, queryClient } from './index'
import { TMe, TUser } from '../schema/user'
// import { APP_WITH_EDITING_ENABLED } from '../utils/constants'

// const { MODE } = import.meta.env

export const useMeQuery = () => {
  // const useMock = MODE === 'development' && APP_WITH_EDITING_ENABLED
  const useMock = false

  return useQuery({
    queryKey: ['me'],
    queryFn: (): Promise<TMe> => {
      return useMock
        ? new Promise((res) => {
            res({
              id: '407a3bc0-db76-4cce-aebc-4291ca5af0d3',
              name: 'Admin 1',
              email: 'kretek@inqool.cz',
              authorities: [],
              owners: null,
              enabled: true,
              username: 'admin',
              role: 'super_admin',
              accountNonExpired: true,
              accountNonLocked: true,
              credentialsNonExpired: true,
            })
          })
        : api().get(`me`).json<TMe>()
    },
  })
}

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: () => {
      return api().post(`auth/logout`)
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
