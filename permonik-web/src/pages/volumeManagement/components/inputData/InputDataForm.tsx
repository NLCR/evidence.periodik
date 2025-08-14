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
import Periodicity from '../periodicity/Periodicity'
import ConfirmDialog from '../../../specimensOverview/components/dialogs/ConfirmDialog'
import Button from '@mui/material/Button'
import { useParams } from 'react-router-dom'
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

  useEffect(() => {
    if (!duplicated && !volumeId) {
      methods.reset(initialState.volumeState)
    }
    if (duplicated) {
      methods.setValue('barCode', '')
      methods.setValue('mutationMark', '')
    }
  }, [duplicated, volumeId, methods])

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
              />
            </TableCell>
          </TableRow>

          <InputDataSubName />
          <InputDataMutation mutations={mutations} />
          <InputDataMutationMark />

          <TableRow>
            <TableCell>{t('volume_overview.bar_code')}</TableCell>
            <TableCell>
              <InputDataTextField name="barCode" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('volume_overview.signature')}</TableCell>
            <TableCell>
              <InputDataTextField name="signature" />
            </TableCell>
          </TableRow>
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
          <TableRow>
            <TableCell>{t('volume_overview.owner')}</TableCell>
            <TableCell>
              <InputDataSelect
                name="ownerId"
                options={owners
                  .filter(
                    (o) =>
                      me.role === 'super_admin' || me.owners?.includes(o.id)
                  )
                  .map((o) => ({ key: o.id, value: o.shorthand }))}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t('volume_overview.note')}</TableCell>
            <TableCell>
              <InputDataTextField name="note" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Periodicity editions={editions} />
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
