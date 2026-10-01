import Checkbox, { type CheckboxProps } from '@mui/material/Checkbox'
import { noop } from 'lodash'
import { type ReactNode } from 'react'
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'

type IconCheckboxProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  CheckboxProps,
  'name' | 'icon' | 'checkedIcon'
> & {
  IconTrue: ReactNode
  IconFalse: ReactNode
  name: FieldPath<TFieldValues>
  afterChange?: (value: boolean) => void
}

const IconCheckbox = <TFieldValues extends FieldValues = FieldValues>({
  name,
  IconTrue,
  IconFalse,
  afterChange = noop,
  ...checkboxProps
}: IconCheckboxProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...checkboxProps}
          name={field.name}
          checked={!!field.value}
          onBlur={field.onBlur}
          onChange={(_, checked) => {
            field.onChange(checked)
            afterChange?.(checked)
          }}
          icon={IconFalse}
          checkedIcon={IconTrue}
        />
      )}
    />
  )
}

export default IconCheckbox
