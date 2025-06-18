import Typography from '@mui/material/Typography/Typography'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import dayjs, { Dayjs } from 'dayjs'
import { useTranslation } from 'react-i18next'

type Props = { date: Dayjs; setDate: (value: Dayjs) => void }

const DuplicationEditCellDateModal = ({ date, setDate }: Props) => {
  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const { t } = useTranslation()

  return (
    <>
      <Typography
        sx={{
          marginBottom: '5px',
          marginRight: 5,
          fontWeight: '600',
        }}
      >
        {t('specimens_overview.duplicate_dialog_description')}
      </Typography>

      <DateCalendar
        value={date}
        onChange={(value) => setDate(value)}
        minDate={dayjs(volumeState.dateFrom)}
        maxDate={dayjs(volumeState.dateTo)}
      />
    </>
  )
}

export default DuplicationEditCellDateModal
