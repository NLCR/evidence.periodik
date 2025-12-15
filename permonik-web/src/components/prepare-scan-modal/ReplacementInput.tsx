import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import { defaultReplacement, TReplacement } from './schemas'

type Props = {
  allPages?: boolean
  viewOnly?: boolean
  value: TReplacement | null
  onChange: (value: TReplacement) => void
}

const ReplacementInputComponent = ({
  label,
  value,
  viewOnly = false,
  onChange,
}: {
  label: string
  value: string
  viewOnly?: boolean
  onChange: (value: string) => void
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

const ReplacementInput = ({
  allPages = undefined,
  viewOnly = false,
  value,
  onChange,
}: Props) => {
  const [replacement, setReplacement] = useState<TReplacement>(
    value ?? defaultReplacement
  )

  const safeSetReplacement = (value: Partial<TReplacement>) => {
    setReplacement((prev) => {
      const newValue = { ...prev, ...value }
      onChange(newValue)
      return newValue
    })
  }

  return (
    <Stack
      direction="row"
      gap={1}
      width={'100%'}
      justifyContent={'space-evenly'}
    >
      <ReplacementInputComponent
        label="Signatura"
        viewOnly={viewOnly}
        value={replacement.signature}
        onChange={(value) => safeSetReplacement({ signature: value })}
      />
      <ReplacementInputComponent
        label="Vlastník"
        viewOnly={viewOnly}
        value={replacement.owner}
        onChange={(value) => safeSetReplacement({ owner: value })}
      />
      <ReplacementInputComponent
        label="Čárový kód"
        viewOnly={viewOnly}
        value={replacement.barcode}
        onChange={(value) => safeSetReplacement({ barcode: value })}
      />
      <ReplacementInputComponent
        label="Mutace"
        viewOnly={viewOnly}
        value={replacement.mutation}
        onChange={(value) => safeSetReplacement({ mutation: value })}
      />
      {!allPages && (
        <ReplacementInputComponent
          label="Rozsah stran"
          viewOnly={viewOnly}
          value={replacement.pages}
          onChange={(value) => safeSetReplacement({ pages: value })}
        />
      )}
    </Stack>
  )
}

export default ReplacementInput
