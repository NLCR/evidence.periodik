import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'
import { noop } from 'lodash'
import { ReactNode } from 'react'
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form'

type IconCheckboxProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  CheckboxProps,
  'name' | 'icon' | 'checkedIcon'
> & {
  iconTrue: ReactNode
  iconFalse: ReactNode
  name: FieldPath<TFieldValues>
  afterChange?: (value: boolean) => void
}

const IconCheckbox = <TFieldValues extends FieldValues = FieldValues>({
  name,
  iconTrue,
  iconFalse,
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
          icon={iconFalse}
          checkedIcon={iconTrue}
        />
      )}
    />
  )
}

export default IconCheckbox
