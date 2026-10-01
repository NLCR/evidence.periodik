import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { type ReactNode } from 'react'
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'

type FormCheckboxProps<TFieldValues extends FieldValues = FieldValues> = {
  label: ReactNode
  name: FieldPath<TFieldValues>
  disabled?: boolean
}

const FormCheckbox = <TFieldValues extends FieldValues = FieldValues>({
  label,
  name,
  disabled = false,
}: FormCheckboxProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              name={field.name}
              slotProps={{ input: { ref: field.ref } }}
              checked={!!field.value}
              onBlur={field.onBlur}
              onChange={(_, checked) => field.onChange(checked)}
              disabled={disabled}
            />
          }
          label={label}
        />
      )}
    />
  )
}

export default FormCheckbox
