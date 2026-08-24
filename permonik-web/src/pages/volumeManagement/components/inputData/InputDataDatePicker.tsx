import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers-pro'
import LockedInputDataItem from './LockedInputDataItem'
import dayjs, { type Dayjs } from 'dayjs'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useState } from 'react'

type EditableData = {
  fieldName: string
  saveChange: (value: Dayjs | null) => boolean | Promise<boolean>
}

type Props = {
  name: string
  /* form key containing field to limit the date selection by from below*/
  minDateName?: string
  /* form key containing field to limit the date selection by from above*/
  maxDateName?: string
  editableData?: EditableData
  onDateChange?: (value: Dayjs | null) => void
}

const InputDataDatePicker = ({
  name,
  minDateName = undefined,
  maxDateName = undefined,
  editableData = undefined,
  onDateChange = undefined,
  ...props
}: Props & DatePickerProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { control, getValues } = useFormContext()
  const [draftValue, setDraftValue] = useState<Dayjs | null>(null)

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
    <LockedInputDataItem
      name={name}
      type="DATE"
      editableData={
        editableData
          ? {
              DialogContent: (
                <DatePicker
                  value={draftValue}
                  minDate={minDate ? dayjs(minDate) : undefined}
                  maxDate={maxDate ? dayjs(maxDate) : undefined}
                  onChange={setDraftValue}
                />
              ),
              fieldName: editableData.fieldName,
              onOpen: () =>
                setDraftValue(getValues(name) ? dayjs(getValues(name)) : null),
              saveChange: () => editableData.saveChange(draftValue),
              changeShouldNotAffectSpecimen: true,
            }
          : undefined
      }
    />
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
            // Preserve the selected calendar day instead of converting local midnight to the previous UTC day.
            onChange={(date) => {
              if (onDateChange) {
                onDateChange(date)
                return
              }

              field.onChange(
                date ? `${date.format('YYYY-MM-DD')}T00:00:00.000Z` : null
              )
            }}
            minDate={minDate ? dayjs(minDate) : undefined}
            maxDate={maxDate ? dayjs(maxDate) : undefined}
          />
        )
      }}
    />
  )
}

export default InputDataDatePicker
