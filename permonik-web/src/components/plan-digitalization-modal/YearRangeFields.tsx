import TextField from '@mui/material/TextField'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { type PlanDigitalizationFilters } from './schemas'

type Props = {
  form: UseFormReturn<PlanDigitalizationFilters>
  minYear: number | undefined
  maxYear: number | undefined
  disabled: boolean
}

const YearRangeFields = ({ form, minYear, maxYear, disabled }: Props) => {
  const { t } = useTranslation()
  const { control, trigger } = form
  const fields = [
    { name: 'yearFrom', label: t('plan_digitalization_modal.year_from') },
    { name: 'yearTo', label: t('plan_digitalization_modal.year_to') },
  ] as const

  return fields.map(({ name, label }) => (
    <Controller
      key={name}
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <TextField
          {...field}
          value={Number.isNaN(field.value) ? '' : field.value}
          onChange={({ target: { value } }) => {
            field.onChange(value === '' ? NaN : Number(value))
            if (name === 'yearFrom') void trigger('yearTo')
          }}
          inputRef={ref}
          disabled={disabled}
          fullWidth
          error={!!error}
          helperText={error?.message}
          label={label}
          type="number"
          slotProps={{ htmlInput: { min: minYear, max: maxYear } }}
        />
      )}
    />
  ))
}

export default YearRangeFields
