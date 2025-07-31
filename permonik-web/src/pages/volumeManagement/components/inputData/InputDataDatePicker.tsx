import { DatePicker, DatePickerProps } from '@mui/x-date-pickers-pro'
import LockedInputDataItem from './LockedInputDataItem'
import dayjs, { Dayjs } from 'dayjs'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useFormContext } from 'react-hook-form'

type Props = {
  name: string
  /* form key containing field to limit the date selection by from below*/
  minDateName?: string
  /* form key containing field to limit the date selection by from above*/
  maxDateName?: string
}

const InputDataDatePicker = ({
  name,
  minDateName = undefined,
  maxDateName = undefined,
  ...props
}: Props & DatePickerProps<Dayjs>) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { setValue, watch } = useFormContext()

  const minValue = minDateName ? watch(minDateName) : props.minDate
  const maxValue = maxDateName ? watch(maxDateName) : props.maxDate

  const value = watch(name)

  return locked ? (
    <LockedInputDataItem name={name} type="DATE" />
  ) : (
    <DatePicker<Dayjs>
      sx={{
        maxWidth: '200px',
        width: '100%',
      }}
      disabled={disabled}
      {...props}
      value={dayjs(value)}
      onChange={(value) => setValue(name, value, { shouldDirty: true })}
      minDate={minValue ? dayjs(minValue) : undefined}
      maxDate={maxValue ? dayjs(maxValue) : undefined}
    />
  )
}

export default InputDataDatePicker
