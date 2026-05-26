import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers-pro'
import LockedInputDataItem from './LockedInputDataItem'
import dayjs from 'dayjs'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

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
  const { control } = useFormContext()

  const watchedMinDate = useWatch({
    name: minDateName ?? '',
    control,
    disabled: !minDateName,
  })

  const watchedMaxDate = useWatch({
    name: maxDateName ?? '',
    control,
    disabled: !maxDateName,
  })

  const minDate = minDateName ? watchedMinDate : props.minDate
  const maxDate = maxDateName ? watchedMaxDate : props.maxDate

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
              width: '100%',
              marginRight: -1,
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
