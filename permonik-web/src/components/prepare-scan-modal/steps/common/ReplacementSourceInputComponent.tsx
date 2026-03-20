import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FC } from 'react'

type ReplacementSourceInputComponentProps = {
  label: string
  value: string | null | undefined
  viewOnly?: boolean
  onChange: (value: string | null | undefined) => void
  fullWidth?: boolean
  disabled?: boolean
}

const ReplacementSourceInputComponent: FC<
  ReplacementSourceInputComponentProps
> = ({
  label,
  value,
  viewOnly = false,
  onChange,
  fullWidth = false,
  disabled = false,
}) => {
  if (viewOnly)
    return (
      <Stack>
        <Typography
          sx={{
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            color: 'primary.main',
          }}
        >
          {label}
        </Typography>
        <Typography>{value}</Typography>
      </Stack>
    )

  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  )
}

export default ReplacementSourceInputComponent
