import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type ControllerRenderProps } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type Props<T> = {
  field: Pick<ControllerRenderProps, 'name' | 'ref' | 'onBlur'> & {
    value: T | null
    onChange: (value: T | null) => void
  }
  options: { item: T; count: number }[]
  label: string
  disabled: boolean
  getKey: (item: T) => string
  getLabel: (item: T) => string | null | undefined
}

const FacetSelect = <T,>({
  field,
  options,
  label,
  disabled,
  getKey,
  getLabel,
}: Props<T>) => {
  const { t } = useTranslation()
  const selectedKey = field.value === null ? '' : getKey(field.value)
  const hasSelection = options.some(({ item }) => getKey(item) === selectedKey)

  return (
    <TextField
      name={field.name}
      inputRef={field.ref}
      onBlur={field.onBlur}
      disabled={disabled}
      fullWidth
      sx={{ minWidth: 0 }}
      select
      label={label}
      value={hasSelection ? selectedKey : ''}
      onChange={({ target: { value } }) => {
        field.onChange(
          options.find(({ item }) => getKey(item) === value)?.item ?? null
        )
      }}
      slotProps={{
        inputLabel: { shrink: true },
        select: { displayEmpty: true },
      }}
    >
      <MenuItem value="">{t('common.all')}</MenuItem>
      {options.map(({ item, count }) => {
        const key = getKey(item)
        return (
          <MenuItem key={key} value={key}>
            <Box
              component="span"
              sx={{ display: 'flex', width: '100%', gap: 2 }}
            >
              <Typography component="span" variant="inherit" noWrap>
                {getLabel(item)}
              </Typography>
              <Box
                component="span"
                sx={{ ml: 'auto', color: 'text.secondary', flexShrink: 0 }}
              >
                {count}
              </Box>
            </Box>
          </MenuItem>
        )
      })}
    </TextField>
  )
}

export default FacetSelect
