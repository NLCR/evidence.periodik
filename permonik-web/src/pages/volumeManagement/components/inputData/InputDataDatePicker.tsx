import { DatePicker, DatePickerProps } from '@mui/x-date-pickers-pro'
import LockedInputDataItem from './LockedInputDataItem'
import dayjs, { Dayjs } from 'dayjs'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'

const InputDataDatePicker = (props: DatePickerProps<Dayjs>) => {
  const { locked, disabled } = useInputDataEditabilityContext()

  return locked ? (
    <LockedInputDataItem
      value={props.value ? dayjs(props.value).format('DD. MM. YYYY') : '-'}
    />
  ) : (
    <DatePicker
      sx={{
        maxWidth: '200px',
        width: '100%',
      }}
      disabled={disabled}
      {...props}
    />
  )
}

export default InputDataDatePicker
