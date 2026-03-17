import { InputDataProps } from './InputData'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { FormProvider, useForm } from 'react-hook-form'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Table from '@mui/material/Table'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import TableBody from '@mui/material/TableBody'
import InputDataSelect from './InputDataSelect'
import InputDataMutation from './InputDataMutation'
import InputDataSubName from './InputDataSubName'
import InputDataMutationMark from './InputDataMutationMark'
import InputDataTextField from './InputDataTextField'
import InputDataDatePicker from './InputDataDatePicker'
import Periodicity from './periodicity/Periodicity'
import ConfirmDialog from '../../../specimensOverview/components/dialogs/ConfirmDialog'
import Button from '@mui/material/Button'
import { useParams, useSearchParams } from 'react-router-dom'
import UnsavedChangesModal from '../UnsavedChangesModal'
import {
  initialState,
  useVolumeManagementStore,
} from '../../../../slices/useVolumeManagementStore'
import { useEffect } from 'react'
import {
  EditableVolumeSchema,
  TEditableVolume,
} from '../../../../schema/volume'
import InputDataBarCode from './InputDataBarCode'
import InputDataSignature from './InputDataSignature'
import { api } from '../../../../api'
import { TSpecimen } from '../../../../schema/specimen'
import InputDataOwner from './InputDataOwner'
import InputDataNote from './InputDataNote'
import { duplicateVolume } from '../../../../utils/duplicateVolume/duplicateVolume'
import { emptyMutationMark } from '../../../../utils/mutationMark'
import {
  basicFieldsToReset,
  FieldsToReset,
} from '../../../../utils/duplicateVolume/types'

const InputDataForm = ({
  editions,
  volume,
  me,
  metaTitles,
  mutations,
  owners,
  duplicated,
}: Omit<InputDataProps, 'isVolumeLoading'>) => {
  const { volumeId } = useParams()
  const { locked, setLocked } = useInputDataEditabilityContext()
  const { t } = useTranslation('global')

  const setHasUnsavedData = useVolumeManagementStore(
    (state) => state.setStateHasUnsavedData
  )

  const methods = useForm<TEditableVolume>({
    defaultValues: volume ?? initialState.volumeState,
    resolver: zodResolver(EditableVolumeSchema),
  })

  const [searchParams] = useSearchParams()
  const fieldsToReset =
    (JSON.parse(
      searchParams.get('fieldsToReset') ?? '[]'
    ) as FieldsToReset[]) || []

  const setSpecimensState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )
  const setVolumeState = useVolumeManagementStore(
    (state) => state.volumeActions.setVolumeState
  )

  // const isDuplicated = location.href.includes('duplicated')

  useEffect(() => {
    const preLoadDuplicateSource = async () => {
      if (!volume && duplicated && !methods.getValues('metaTitleId')) {
        const volumeDuplicateSourceId = searchParams.get(
          'volumeDuplicateSourceId'
        )
        if (!volumeDuplicateSourceId) return
        const volumeData = await api()
          .get(`volume/${volumeDuplicateSourceId}/detail`)
          .json<{ volume: TEditableVolume; specimens: TSpecimen[] } | null>()

        if (!volumeData) return

        const { volume: duplicatedVolume, specimens: duplicatedSpecimens } =
          duplicateVolume(
            { ...volumeData.volume, isLoading: false },
            volumeData.specimens,
            fieldsToReset
          )

        methods.reset(duplicatedVolume)
        setVolumeState(duplicatedVolume, true)
        setSpecimensState(duplicatedSpecimens, true)
      }
    }

    preLoadDuplicateSource()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!duplicated) {
      methods.reset(
        volumeId
          ? (volume ?? initialState.volumeState)
          : initialState.volumeState
      )
      setVolumeState(
        { ...(volume ?? initialState.volumeState), isLoading: false },
        false
      )
    } else {
      // reset all applicable fields
      for (const field of fieldsToReset.filter((f) =>
        basicFieldsToReset.includes(f)
      )) {
        if (field === FieldsToReset.mutationMark) {
          methods.setValue('mutationMark', emptyMutationMark)
        } else {
          methods.setValue(FieldsToReset[field] as keyof TEditableVolume, '')
        }
      }
      methods.setValue('created', null)
      methods.setValue('createdBy', null)
      methods.setValue('updated', null)
      methods.setValue('updatedBy', null)
      methods.setValue('id', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicated, volumeId, fieldsToReset.toString()])

  return (
    <FormProvider {...methods}>
      <Table
        size="small"
        sx={{
          marginBottom: '16px',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>
              {t('volume_overview.name')}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>
              {t('volume_overview.value')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{t('volume_overview.meta_title')}</TableCell>
            <TableCell>
              <InputDataSelect
                name="metaTitleId"
                options={metaTitles.map((metaTitle) => ({
                  key: metaTitle.id,
                  value: metaTitle.name,
                }))}
                onChangeCallback={(value: string) => {
                  // update the names of all periodicity days
                  const metaTitle = metaTitles.find(
                    (metatitle) => metatitle.id === value
                  )?.name

                  const periodicity = methods.getValues('periodicity')
                  periodicity.forEach((day, index) => {
                    if (day.numExists) {
                      methods.setValue(
                        `periodicity.${index}.name`,
                        metaTitle ?? ''
                      )
                    }
                  })
                }}
              />
            </TableCell>
          </TableRow>

          <InputDataSubName />
          <InputDataMutation mutations={mutations} />
          <InputDataMutationMark />
          <InputDataBarCode />
          <InputDataSignature />

          <TableRow>
            <TableCell>{t('volume_overview.year')}</TableCell>
            <TableCell>
              <InputDataTextField inputMode="decimal" name="year" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('volume_overview.date_from')}</TableCell>
            <TableCell>
              <InputDataDatePicker name="dateFrom" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('volume_overview.first_number')}</TableCell>
            <TableCell>
              <InputDataTextField inputMode="decimal" name="firstNumber" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('volume_overview.date_to')}</TableCell>
            <TableCell>
              <InputDataDatePicker minDateName="dateFrom" name="dateTo" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('volume_overview.last_number')}</TableCell>
            <TableCell>
              <InputDataTextField inputMode="decimal" name="lastNumber" />
            </TableCell>
          </TableRow>

          <InputDataOwner owners={owners} me={me} />
          <InputDataNote />
        </TableBody>
      </Table>
      <Periodicity editions={editions} metaTitles={metaTitles} />
      {(volumeId || locked) && (
        <ConfirmDialog
          TriggerButton={
            <Button sx={{ marginTop: 1 }} fullWidth variant="outlined">
              {locked
                ? t('volume_overview.unlock_edit')
                : t('volume_overview.revert_edit')}
            </Button>
          }
          onConfirm={() => {
            // cancel editing
            if (!locked) {
              methods.reset()
              setHasUnsavedData(false)
            }
            setLocked(!locked)
          }}
          title={
            locked
              ? t('volume_overview.unlock_edit_dialog_title')
              : t('volume_overview.revert_edit_dialog_title')
          }
          description={
            locked
              ? t('volume_overview.unlock_edit_dialog_description')
              : t('volume_overview.revert_edit_dialog_description')
          }
        />
      )}
      <UnsavedChangesModal />
    </FormProvider>
  )
}

export default InputDataForm
