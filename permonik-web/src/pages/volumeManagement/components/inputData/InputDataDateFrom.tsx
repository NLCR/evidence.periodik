import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import dayjs, { type Dayjs } from 'dayjs'
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

const InputDataDateFrom = ({ editions }: { editions: TEdition[] }) => {
  const { t } = useTranslation('global')
  const setDateFrom = useVolumeManagementStore(
    (state) => state.volumeActions.setDateFrom
  )
  const specimens = useVolumeManagementStore((state) => state.specimensState)
  const volume = useVolumeManagementStore((state) => state.volumeState)
  const setSpecimens = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )
  const { getValues, setValue } = useFormContext()

  const saveChange = (value: Dayjs | null) => {
    if (!value?.isValid()) return false

    const dateFrom = value.format('YYYY-MM-DD')
    const dateTo = getValues('dateTo')
    if (!isVolumeDateRangeValid(dateFrom, dateTo, specimens)) {
      toast.error(t('volume_overview.date_range_excludes_active_specimen'))
      return false
    }

    setValue('dateFrom', `${dateFrom}T00:00:00.000Z`, { shouldDirty: true })
    setDateFrom(value)
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
      <TableCell>{t('volume_overview.date_from')}</TableCell>
      <TableCell>
        <InputDataDatePicker
          name="dateFrom"
          minDate={dayjs('1600-01-01')}
          editableData={{
            fieldName: t('volume_overview.date_from'),
            saveChange,
          }}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataDateFrom
