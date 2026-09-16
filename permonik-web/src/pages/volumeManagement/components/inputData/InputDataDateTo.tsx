import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useFormContext } from 'react-hook-form'
import { type TEdition } from '../../../../schema/edition'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import {
  isVolumeDateRangeValid,
  synchronizeVolumeDateRange,
} from '../../../../utils/volumeDateRange'
import InputDataDatePicker from './InputDataDatePicker'

const InputDataDateTo = ({ editions }: { editions: TEdition[] }) => {
  const { t } = useTranslation('global')
  const setDateTo = useVolumeManagementStore(
    (state) => state.volumeActions.setDateTo
  )
  const specimens = useVolumeManagementStore((state) => state.specimensState)
  const volume = useVolumeManagementStore((state) => state.volumeState)
  const setSpecimens = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )
  const { getValues, setValue } = useFormContext()

  const saveChange = (value: Dayjs | null) => {
    if (!value?.isValid()) return false

    const dateTo = value.format('YYYY-MM-DD')
    const dateFrom = getValues('dateFrom')
    if (!isVolumeDateRangeValid(dateFrom, dateTo, specimens)) {
      toast.error(t('volume_overview.date_range_excludes_active_specimen'))
      return false
    }

    setValue('dateTo', `${dateTo}T00:00:00.000Z`, { shouldDirty: true })
    setDateTo(value)
    setSpecimens(
      synchronizeVolumeDateRange({
        dateFrom,
        dateTo,
        specimens,
        volume,
        defaultEditionId: editions.find((edition) => edition.isDefault)?.id,
      }),
      true
    )
    return true
  }

  return (
    <TableRow>
      <TableCell>{t('volume_overview.date_to')}</TableCell>
      <TableCell>
        <InputDataDatePicker
          name="dateTo"
          minDateName="dateFrom"
          editableData={{
            fieldName: t('volume_overview.date_to'),
            saveChange,
          }}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataDateTo
