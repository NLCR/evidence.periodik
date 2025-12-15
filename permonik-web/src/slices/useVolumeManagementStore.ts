/* eslint-disable no-param-reassign */
import { create } from 'zustand'
import { produce } from 'immer'
import { devtools } from 'zustand/middleware'
import dayjs, { Dayjs } from 'dayjs'
import {
  TEditableVolume,
  TEditableVolumePeriodicity,
  TVolumePeriodicityDays,
} from '../schema/volume'
import { TEditableSpecimen } from '../schema/specimen'
import { TEdition } from '../schema/edition'
import { filterSpecimen } from '../utils/specimen'
import clone from 'lodash/clone'
import { emptyMutationMark, TMutationMark } from '../utils/mutationMark'

const periodicityDays: TVolumePeriodicityDays[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const initialPeriodicity: TEditableVolumePeriodicity[] = [
  ...periodicityDays.map((d) => ({
    numExists: false,
    editionId: null,
    day: d,
    pagesCount: '',
    name: '',
    subName: '',
    isAttachment: false,
  })),
]

export const initialState: TVariablesState = {
  volumeState: {
    id: '',
    isLoading: false,
    barCode: '',
    dateFrom: dayjs()
      .subtract(1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD'),
    dateTo: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
    firstNumber: '',
    lastNumber: '',
    metaTitleId: '',
    subName: '',
    mutationId: '',
    note: '',
    ownerId: '',
    periodicity: initialPeriodicity,
    mutationMark: emptyMutationMark,
    showAttachmentsAtTheEnd: false,
    signature: '',
    year: '',
  },
  specimensState: [],
  periodicityGenerationUsed: false,
  stateHasUnsavedData: false,
}

interface TVariablesState {
  volumeState: TEditableVolume
  specimensState: TEditableSpecimen[]
  periodicityGenerationUsed: boolean
  stateHasUnsavedData: boolean
}

interface TState extends TVariablesState {
  setInitialState: () => void
  volumeActions: {
    setVolumeState: (
      value: TEditableVolume,
      stateHasUnsavedData: boolean
    ) => void
    setMetaTitle: (id: string, name: string) => void
    setLoading: (value: boolean) => void
    setSubName: (value: string) => void
    setMutationId: (value: string) => void
    setMutationMark: (value: TMutationMark) => void
    setBarCode: (value: string) => void
    setSignature: (value: string) => void
    setYear: (value: string) => void
    setDateFrom: (value: Dayjs | null) => void
    setDateTo: (value: Dayjs | null) => void
    setFirstNumber: (value: string) => void
    setLastNumber: (value: string) => void
    setOwnerId: (value: string) => void
    setNote: (value: string) => void
    setShowAttachmentsAtTheEnd: (value: boolean) => void
  }
  volumePeriodicityActions: {
    setDefaultPeriodicityEdition: (values: TEdition[]) => void
    setNumExists: (value: boolean, index: number) => void
    setEditionId: (value: string | null, index: number) => void
    setPagesCount: (value: string, index: number) => void
    setName: (value: string, index: number) => void
    setSubName: (value: string, index: number) => void
    setPeriodicityGenerationUsed: (value: boolean) => void
    setPeriodicityState: (periodicity: TEditableVolumePeriodicity[]) => void
  }
  specimensActions: {
    setSpecimensState: (
      value: TEditableSpecimen[],
      stateHasUnsavedData: boolean
    ) => void
    setSpecimensById: (specimens: TEditableSpecimen[]) => void
    setSpecimen: (value: TEditableSpecimen) => void
  }
  setStateHasUnsavedData: (value: boolean) => void
}

export const useVolumeManagementStore = create<TState>()(
  devtools((set) => ({
    ...initialState,
    setInitialState: () =>
      set(
        produce((state: TState) => {
          state.volumeState = initialState.volumeState
          state.specimensState = initialState.specimensState
          state.periodicityGenerationUsed =
            initialState.periodicityGenerationUsed
          state.stateHasUnsavedData = false
        })
      ),
    volumeActions: {
      setVolumeState: (value, stateHasUnsavedData) =>
        set(
          produce((state: TState) => {
            state.volumeState = value
            state.stateHasUnsavedData = stateHasUnsavedData
          })
        ),
      setMetaTitle: (id, name) =>
        set(
          produce((state: TState) => {
            state.volumeState.metaTitleId = id
            state.volumeState.periodicity = state.volumeState.periodicity.map(
              (p) => ({ ...p, name: name })
            )
            state.stateHasUnsavedData = true
          })
        ),
      setSubName: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.subName = value
            state.volumeState.periodicity = state.volumeState.periodicity.map(
              (p) => ({ ...p, subName: value })
            )
            state.stateHasUnsavedData = true
          })
        ),
      setMutationId: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.mutationId = value
            state.stateHasUnsavedData = true
          })
        ),
      setMutationMark: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.mutationMark = value
            state.stateHasUnsavedData = true
          })
        ),
      setBarCode: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.barCode = value.trim()
            state.stateHasUnsavedData = true
          })
        ),
      setSignature: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.signature = value
            state.stateHasUnsavedData = true
          })
        ),
      setYear: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.year = value.replace(/\D/g, '')
            state.stateHasUnsavedData = true
          })
        ),
      setDateFrom: (value) =>
        set(
          produce((state: TState) => {
            if (value?.isValid()) {
              state.volumeState.dateFrom = value.format('YYYY-MM-DD')
              state.volumeState.dateTo = value
                .endOf('month')
                .format('YYYY-MM-DD')
              state.stateHasUnsavedData = true
            } else {
              state.volumeState.dateFrom = ''
              state.volumeState.dateTo = ''
            }
          })
        ),
      setDateTo: (value) =>
        set(
          produce((state: TState) => {
            if (value?.isValid()) {
              state.volumeState.dateTo = value.format('YYYY-MM-DD')
              state.stateHasUnsavedData = true
            } else {
              state.volumeState.dateTo = ''
            }
          })
        ),
      setFirstNumber: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.firstNumber = value.replace(/\D/g, '')
            state.stateHasUnsavedData = true
          })
        ),
      setLastNumber: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.lastNumber = value.replace(/\D/g, '')
            state.stateHasUnsavedData = true
          })
        ),
      setOwnerId: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.ownerId = value
            state.stateHasUnsavedData = true
          })
        ),
      setNote: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.note = value
            state.stateHasUnsavedData = true
          })
        ),
      setShowAttachmentsAtTheEnd: (value) =>
        set(
          produce((state: TState) => {
            state.volumeState.showAttachmentsAtTheEnd = value
            state.stateHasUnsavedData = true
          })
        ),
    },
    volumePeriodicityActions: {
      setDefaultPeriodicityEdition: (values: TEdition[]) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity = state.volumeState.periodicity.map(
              (p) => ({
                ...p,
                editionId: values.find((pub) => pub.isDefault)?.id || '',
              })
            )
          })
        ),
      setNumExists: (value: boolean, index: number) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity[index].numExists = value
            state.stateHasUnsavedData = true
          })
        ),
      setEditionId: (value: string | null, index: number) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity[index].editionId = value
            state.stateHasUnsavedData = true
          })
        ),
      setPagesCount: (value: string, index: number) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity[index].pagesCount = value.replace(
              /\D/g,
              ''
            )
            state.stateHasUnsavedData = true
          })
        ),
      setName: (value: string, index: number) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity[index].name = value
            state.stateHasUnsavedData = true
          })
        ),
      setSubName: (value: string, index: number) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity[index].subName = value
            state.stateHasUnsavedData = true
          })
        ),
      setPeriodicityGenerationUsed: (value: boolean) =>
        set(
          produce((state: TState) => {
            state.periodicityGenerationUsed = value
            state.stateHasUnsavedData = value
          })
        ),
      setPeriodicityState: (periodicity: TEditableVolumePeriodicity[]) =>
        set(
          produce((state: TState) => {
            state.volumeState.periodicity = periodicity
            state.stateHasUnsavedData = true
          })
        ),
    },
    specimensActions: {
      setSpecimensState: (value, stateHasUnsavedData) =>
        set(
          produce((state: TState) => {
            state.specimensState = value
            state.stateHasUnsavedData = stateHasUnsavedData
          })
        ),
      setSpecimensById: (values) =>
        set(
          produce((state: TState) => {
            const specimensClone = clone(state.specimensState)
            let dataChanged = false

            values.forEach((value) => {
              const index = specimensClone.findIndex((s) => s.id === value.id)
              if (index >= 0) {
                specimensClone[index] = value
                dataChanged = true
              }
            })
            if (dataChanged) {
              state.specimensState = specimensClone
              state.stateHasUnsavedData = true
            }
          })
        ),
      setSpecimen: (value) =>
        set(
          produce((state: TState) => {
            const index = state.specimensState.findIndex(
              (s) => s.id === value.id
            )
            if (index >= 0) {
              state.specimensState[index] = filterSpecimen(value)
              state.stateHasUnsavedData = true
            }
          })
        ),
    },
    setStateHasUnsavedData: (value) =>
      set(() => ({
        stateHasUnsavedData: value,
      })),
  }))
)
