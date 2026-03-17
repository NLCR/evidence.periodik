import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FC } from 'react'

type ReplacementInputComponentProps = {
  label: string
  value: string
  viewOnly?: boolean
  onChange: (value: string) => void
}

const ReplacementInputComponent: FC<ReplacementInputComponentProps> = ({
  label,
  value,
  viewOnly = false,
  onChange,
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
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default ReplacementInputComponent
