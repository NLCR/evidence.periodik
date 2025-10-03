import { DatePicker, DatePickerProps } from '@mui/x-date-pickers-pro'
import LockedInputDataItem from './LockedInputDataItem'
import dayjs from 'dayjs'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { Controller, useFormContext } from 'react-hook-form'

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
}: Props & DatePickerProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { control, watch } = useFormContext()

  const minDate = minDateName ? watch(minDateName) : props.minDate
  const maxDate = maxDateName ? watch(maxDateName) : props.maxDate

  return locked ? (
    <LockedInputDataItem name={name} type="DATE" />
  ) : (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <DatePicker
            sx={{
              maxWidth: '200px',
              width: '100%',
            }}
            disabled={disabled || props.disabled}
            {...props}
            defaultValue={props.defaultValue ? dayjs(props.defaultValue) : null}
            value={field.value ? dayjs(field.value) : null}
            onChange={(date) => field.onChange(date?.toISOString())}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
          />
        )
      }}
    />
  )
}

export default InputDataDatePicker
