import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Dayjs } from 'dayjs'
import { SpecimenStateEnum, TSpecimenState } from '../schema/specimen'
import { APP_WITH_EDITING_ENABLED } from '../utils/constants'

export type TParams = {
  dateStart: Dayjs | null
  dateEnd: Dayjs | null
  names: string[]
  subNames: string[]
  mutationIds: string[]
  editionIds: string[]
  mutationMarks: string[]
  ownerIds: string[]
  damageTypes: string[]
}

export const initialParams: TParams = {
  dateStart: null,
  dateEnd: null,
  names: [],
  subNames: [],
  mutationIds: [],
  editionIds: [],
  mutationMarks: [],
  ownerIds: [],
  damageTypes: [],
}

interface TVariablesState {
  params: typeof initialParams
  pagination: { pageIndex: number; pageSize: number }
  barCodeInput: string
  specimenStates: TSpecimenState[] // číslo chybí / číslo existuje
  view: 'CALENDAR' | 'TABLE'
  synchronizeYearsBetweenViews: boolean
  calendarDate: Dayjs | null
  calendarMinDate: Dayjs | null
  lastViewedMetaTitleId: string
  sliderRange: [Dayjs, Dayjs] | null
}

interface TState extends TVariablesState {
  setParams: (values: typeof initialParams) => void
  setBarCodeInput: (value: string) => void
  setSpecimenStates: (value: TSpecimenState[]) => void
  setPagination: (value: { pageIndex: number; pageSize: number }) => void
  resetAll: (calendarDates?: [Dayjs, Dayjs]) => void
  setView: (value: 'CALENDAR' | 'TABLE') => void
  setSynchronizeYearsBetweenViews: (value: boolean) => void
  setCalendarDate: (value: Dayjs) => void
  setCalendarMinDate: (value: Dayjs) => void
  setLastViewedMetaTitleId: (value: string) => void
  setSliderRange: (value: [Dayjs, Dayjs]) => void
}

export const useSpecimensOverviewStore = create<TState>()(
  devtools((set) => ({
    params: initialParams,
    pagination: { pageIndex: 0, pageSize: 100 },
    barCodeInput: '',
    specimenStates: [SpecimenStateEnum.numExists],
    view: APP_WITH_EDITING_ENABLED ? 'TABLE' : 'CALENDAR',
    synchronizeYearsBetweenViews: true,
    calendarDate: null,
    calendarMinDate: null,
    lastViewedMetaTitleId: '',
    sliderRange: null,
    setParams: (values) =>
      set((state) => ({
        params: values,
        pagination: { ...state.pagination, pageIndex: 0 },
      })),
    setBarCodeInput: (value) =>
      set((state) => ({
        barCodeInput: value,
        pagination: { ...state.pagination, pageIndex: 0 },
      })),
    setSpecimenStates: (value) =>
      set((state) => ({
        specimenStates: value,
        pagination: { ...state.pagination, pageIndex: 0 },
      })),
    setPagination: (value) => set(() => ({ pagination: value })),
    resetAll: (calendarDates) =>
      set((state) => ({
        barCodeInput: '',
        params: {
          ...initialParams,
          dateStart: calendarDates?.[0] ?? null,
          dateEnd: calendarDates?.[1] ?? null,
        },
        pagination: { ...state.pagination, pageIndex: 0 },
      })),
    setView: (value) => set(() => ({ view: value })),
    setSynchronizeYearsBetweenViews: (value) =>
      set(() => ({ synchronizeYearsBetweenViews: value })),
    setCalendarDate: (value) => set(() => ({ calendarDate: value })),
    setCalendarMinDate: (value) => set(() => ({ calendarMinDate: value })),
    setLastViewedMetaTitleId: (value) =>
      set(() => ({ lastViewedMetaTitleId: value })),
    setSliderRange: (value) => set(() => ({ sliderRange: value })),
  }))
)
