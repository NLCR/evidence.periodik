import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import clone from 'lodash/clone'
import { useTranslation } from 'react-i18next'
import { useVolumeManagementStore } from '../slices/useVolumeManagementStore'
import { VolumeSchema } from '../schema/volume'
import { SpecimenSchema, type TEditableSpecimen } from '../schema/specimen'
import {
  useCreateVolumeWithSpecimensMutation,
  useDeleteVolumeWithSpecimensMutation,
  useUpdateOvergeneratedVolumeWithSpecimensMutation,
  useUpdateVolumeWithSpecimensMutation,
} from '../api/volume'
import { type TEdition } from '../schema/edition'
import { BACK_META_TITLE_ID } from '../utils/constants'
import { generateVolumeUrlWithParams } from '../utils/generateVolumeUrlWithParams'
import { repairOrCreateSpecimen } from '../utils/specimen'
import { repairVolume } from '../utils/volume'
import { waitFor } from '../utils/waitFor'
import i18next from '../i18next'
import { type RefObject } from 'react'
import { type GridApiPro } from '@mui/x-data-grid-pro/models'
import { duplicateVolume } from '../utils/duplicateVolume/duplicateVolume'
import { type FieldsToReset } from '../utils/duplicateVolume/types'

const useVolumeManagementActions = (
  apiRef: RefObject<GridApiPro | null>,
  editions: TEdition[],
  markVolumeFormSaved: () => void
) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { mutateAsync: callUpdate, status: updateStatus } =
    useUpdateVolumeWithSpecimensMutation()
  const { mutateAsync: callCreate, status: createStatus } =
    useCreateVolumeWithSpecimensMutation()
  const { mutateAsync: callDelete, status: deleteStatus } =
    useDeleteVolumeWithSpecimensMutation()
  const {
    mutateAsync: callOvergeneratedUpdate,
    status: overgeneratedUpdateStatus,
  } = useUpdateOvergeneratedVolumeWithSpecimensMutation()

  const volumeActions = useVolumeManagementStore((state) => state.volumeActions)
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )
  const setStateHasUnsavedData = useVolumeManagementStore(
    (state) => state.setStateHasUnsavedData
  )

  const setSpecimensState =
    useVolumeManagementStore.getState().specimensActions.setSpecimensState

  const doValidation = (useMinSpecimensCount = true) => {
    const unflushedRows: TEditableSpecimen[] = []
    // flush unflushed updates
    apiRef.current?.getAllRowIds().forEach((rowId) => {
      if (apiRef.current?.getRowMode(rowId) === 'edit') {
        apiRef.current?.stopRowEditMode({ id: rowId })
        const row =
          apiRef.current.getRowWithUpdatedValues(rowId, '') ??
          apiRef.current.getRow(rowId)
        if (row) unflushedRows.push(row as TEditableSpecimen)
      }
    })
    const unflushedRowIds = unflushedRows.map((i) => i.id)

    //get state when is necessary → this approach doesn't cause rerender of functions and whole hook
    const volumeState = useVolumeManagementStore.getState().volumeState
    const specimensState = useVolumeManagementStore
      .getState()
      .specimensState.map((specimen) => {
        if (unflushedRowIds.includes(specimen.id)) {
          const newRow = unflushedRows.find((row) => row.id === specimen.id)
          if (newRow) return newRow
        }
        return specimen
      })

    const volumeClone = clone(volumeState)
    const specimensClone = clone(specimensState)

    const repairedVolume = repairVolume(volumeClone, editions || [])
    const repairedSpecimens = specimensClone.map((s) =>
      repairOrCreateSpecimen(s, repairedVolume)
    )

    const volumeValidation = VolumeSchema.safeParse(repairedVolume)
    const specimensValidation = SpecimenSchema.array()
      .min(useMinSpecimensCount ? 1 : 0, i18next.t('schema.specimens_min'))
      .safeParse(repairedSpecimens)

    if (!volumeValidation.success) {
      // toast.error(t('volume_overview.volume_input_data_validation_error'))
      volumeValidation.error.issues.forEach((e) => toast.error(e.message))

      throw new Error(volumeValidation.error.message)
    }
    if (!specimensValidation.success) {
      // toast.error(t('volume_overview.specimens_validation_error'))
      specimensValidation.error.issues.forEach((e) => toast.error(e.message))

      throw new Error(specimensValidation.error.message)
    }

    return {
      repairedVolume,
      repairedSpecimens,
    }
  }

  const setSpecimensVerified = (
    input: TEditableSpecimen[]
  ): TEditableSpecimen[] =>
    input.map((sp) => {
      if (sp.numExists) {
        const damageTypes = new Set(sp.damageTypes)
        damageTypes.add('OK')
        return {
          ...sp,
          damageTypes: Array.from(damageTypes),
        }
      }
      return sp
    })

  const doUpdate = async (setVerified = false) => {
    try {
      const data = doValidation()

      const newSpecimens = setVerified
        ? setSpecimensVerified(data.repairedSpecimens)
        : data.repairedSpecimens

      try {
        await callUpdate({
          volume: data.repairedVolume,
          specimens: newSpecimens,
        })
        toast.success(t('volume_overview.volume_updated_successfully'))
        setStateHasUnsavedData(false)
        markVolumeFormSaved()

        setSpecimensState(newSpecimens, false)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // toast.error(t('volume_overview.volume_update_error'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const doOvergeneratedUpdate = async (setVerified = false) => {
    try {
      const data = doValidation()

      const newSpecimens = setVerified
        ? setSpecimensVerified(data.repairedSpecimens)
        : data.repairedSpecimens

      try {
        await callOvergeneratedUpdate({
          volume: data.repairedVolume,
          specimens: newSpecimens,
        })

        toast.success(t('volume_overview.volume_updated_successfully'))
        setStateHasUnsavedData(false)
        markVolumeFormSaved()
        volumePeriodicityActions.setPeriodicityGenerationUsed(false)

        setSpecimensState(newSpecimens, false)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // toast.error(t('volume_overview.volume_update_error'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const doCreate = async (setVerified = false) => {
    try {
      const stateHasUnsavedData =
        useVolumeManagementStore.getState().stateHasUnsavedData

      const data = doValidation()

      try {
        const id = await callCreate({
          volume: data.repairedVolume,
          specimens: setVerified
            ? setSpecimensVerified(data.repairedSpecimens)
            : data.repairedSpecimens,
        })
        setStateHasUnsavedData(false)
        markVolumeFormSaved()
        await waitFor(
          () => !useVolumeManagementStore.getState().stateHasUnsavedData
        )

        toast.success(t('volume_overview.volume_created_successfully'))
        navigate(`/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${id}`)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setStateHasUnsavedData(stateHasUnsavedData)
        // toast.error(t('volume_overview.volume_create_error'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const doDelete = async () => {
    try {
      const stateHasUnsavedData =
        useVolumeManagementStore.getState().stateHasUnsavedData

      const data = doValidation(false)
      setStateHasUnsavedData(false)

      try {
        await callDelete(data.repairedVolume.id)
        setStateHasUnsavedData(false)

        await waitFor(
          () => !useVolumeManagementStore.getState().stateHasUnsavedData
        )

        toast.success(t('volume_overview.volume_deleted_successfully'))
        navigate(`/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/`)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setStateHasUnsavedData(stateHasUnsavedData)
        // toast.error(t('volume_overview.volume_deletion_error'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const doDuplicate = async (fieldsToReset: FieldsToReset[]) => {
    try {
      const { repairedVolume, repairedSpecimens } = doValidation(false)
      setStateHasUnsavedData(false)

      await waitFor(
        () => !useVolumeManagementStore.getState().stateHasUnsavedData
      )

      const { volume: duplicatedVolume, specimens: duplicatedSpecimens } =
        duplicateVolume(
          { ...repairedVolume, isLoading: false },
          repairedSpecimens,
          fieldsToReset
        )

      navigate(
        generateVolumeUrlWithParams(
          `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/duplicated`,
          searchParams.get(BACK_META_TITLE_ID) || '',
          undefined,
          undefined,
          fieldsToReset
        )
      )
      specimensActions.setSpecimensState(duplicatedSpecimens, true)
      volumeActions.setVolumeState(duplicatedVolume, true)
    } catch (e) {
      console.error(e)
    }
  }

  return {
    doDuplicate,
    doUpdate,
    doOvergeneratedUpdate,
    doCreate,
    doDelete,
    pendingActions:
      updateStatus === 'pending' ||
      createStatus === 'pending' ||
      overgeneratedUpdateStatus === 'pending' ||
      deleteStatus === 'pending',
  }
}

export default useVolumeManagementActions
