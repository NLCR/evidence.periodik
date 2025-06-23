import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { api, queryClient } from './index'
import {
  TSpecimen,
  TSpecimenDamageTypesFacet,
  TSpecimenFacet,
  TSpecimensPublicationDays,
} from '../schema/specimen'
import { useSpecimensOverviewStore } from '../slices/useSpecimensOverviewStore'

export interface TSpecimensFacets {
  names: TSpecimenFacet[]
  subNames: TSpecimenFacet[]
  mutationIds: TSpecimenFacet[]
  editionIds: TSpecimenFacet[]
  mutationMarks: TSpecimenFacet[]
  ownerIds: TSpecimenFacet[]
  damageTypes: TSpecimenDamageTypesFacet[]
}

export const useSpecimenFacetsQuery = (metaTitleId?: string) => {
  const params = useSpecimensOverviewStore((state) => state.params)
  const barCodeInput = useSpecimensOverviewStore((state) => state.barCodeInput)
  const stateButtons = useSpecimensOverviewStore((state) => state.stateButtons)
  const view = useSpecimensOverviewStore((state) => state.view)

  return useQuery({
    queryKey: [
      'specimen',
      'facets',
      metaTitleId,
      params,
      barCodeInput,
      stateButtons,
      view,
    ],
    queryFn: () => {
      const formData = new FormData()
      formData.set(
        'facets',
        JSON.stringify({
          ...params,
          barCode: barCodeInput,
          specimenStates: stateButtons,
        })
      )
      formData.set('view', view)

      return api()
        .post(`specimen/${metaTitleId}/list/facets`, {
          body: formData,
        })
        .json<TSpecimensFacets>()
    },
    placeholderData: keepPreviousData,
    enabled: !!metaTitleId,
  })
}

export interface TSpecimenList extends TSpecimensPublicationDays {
  specimens: TSpecimen[]
  count: number
  owners: string[]
}

export const useSpecimenListQuery = (metaTitleId?: string) => {
  const params = useSpecimensOverviewStore((state) => state.params)
  const pagination = useSpecimensOverviewStore((state) => state.pagination)
  const barCodeInput = useSpecimensOverviewStore((state) => state.barCodeInput)
  const stateButtons = useSpecimensOverviewStore((state) => state.stateButtons)

  const calendarDate = useSpecimensOverviewStore((state) => state.calendarDate)
  const view = useSpecimensOverviewStore((state) => state.view)

  const dayJsDate = dayjs(calendarDate)

  const startOfMonth = dayJsDate.startOf('month')
  const endOfMonth = dayJsDate.endOf('month')

  const startOfMonthUTC = `${startOfMonth.year()}-${String(startOfMonth.month() + 1).padStart(2, '0')}-01T00:00:00.000Z`
  const endOfMonthUTC = `${endOfMonth.year()}-${String(endOfMonth.month() + 1).padStart(2, '0')}-${String(endOfMonth.date()).padStart(2, '0')}T23:59:59.999Z`

  return useQuery({
    queryKey: [
      'specimen',
      'list',
      view,
      metaTitleId,
      pagination.pageIndex,
      pagination.pageSize,
      params,
      calendarDate,
      barCodeInput,
      stateButtons,
    ],
    queryFn: () => {
      const formData = new FormData()
      if (view === 'table') {
        formData.set(
          'offset',
          (pagination.pageIndex > 0
            ? pagination.pageIndex * pagination.pageSize + 1
            : pagination.pageIndex * pagination.pageSize
          ).toString()
        )
        formData.set('rows', pagination.pageSize.toString())
      } else {
        formData.set('offset', '0')
        formData.set('rows', '1000')
      }
      formData.set(
        'facets',
        JSON.stringify({
          ...params,
          barCode: barCodeInput,
          specimenStates: stateButtons,
          calendarDateStart: startOfMonthUTC,
          calendarDateEnd: endOfMonthUTC,
        })
      )
      formData.set('view', view)

      return api()
        .post(`specimen/${metaTitleId}/list`, {
          body: formData,
        })
        .json<TSpecimenList>()
    },
    placeholderData: keepPreviousData,
    enabled: !!metaTitleId,
  })
}

export const useSpecimensStartDateForCalendar = (metaTitleId?: string) => {
  return useQuery({
    queryKey: ['specimen', 'date', metaTitleId],
    queryFn: () =>
      api().get(`specimen/${metaTitleId}/start-date`).json<number>(),
    enabled: !!metaTitleId,
  })
}

export const useGetSpecimenNamesAndSubNames = () => {
  return useQuery({
    queryKey: ['specimen', 'names'],
    queryFn: () =>
      api()
        .get(`specimen/names`)
        .json<{ names: string[]; subNames: string[] }>(),
  })
}

type TDeleteSpecimen = {
  volumeId: string
  specimenId: string
}

export const useDeleteSpecimenById = () => {
  return useMutation<void, unknown, TDeleteSpecimen>({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: ({ volumeId, specimenId }) =>
      api().delete(`specimen/${specimenId}`).json<void>(),
    onSuccess: (_, editArgs) => {
      queryClient.invalidateQueries({
        queryKey: ['volume', 'detail', editArgs.volumeId],
      })
    },
  })
}
