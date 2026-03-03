import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import { emptyReplacement, TReplacement } from './schemas'
import IconButton from '@mui/material/IconButton'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'

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
    value ?? emptyReplacement
  )

  const [mode, setMode] = useState<'SELECT' | 'MANUAL'>('SELECT')

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
      {mode === 'MANUAL' ? (
        <>
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
          <ReplacementInputComponent
            label="Mutační vydání"
            viewOnly={viewOnly}
            value={replacement.mutationEdition}
            onChange={(value) => safeSetReplacement({ mutationEdition: value })}
          />
          {!allPages && (
            <ReplacementInputComponent
              label="Strany"
              viewOnly={viewOnly}
              value={replacement.pages}
              onChange={(value) => safeSetReplacement({ pages: value })}
            />
          )}
        </>
      ) : (
        <>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              Vyberte náhradní svazek
            </InputLabel>
            <Select
              fullWidth
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Age"
            >
              <MenuItem value={10}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box>Signatura 123 · MZK · Praha ★★ · 5/1988-8/1988</Box>
                  {/* <Box sx={{ color: 'text.secondary' }}>3999</Box> */}
                </Box>
              </MenuItem>
              <MenuItem value={20}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box>Signatura 113 · KUK · Praha ★ · 1/1988-3/1988</Box>
                  {/* <Box sx={{ color: 'text.secondary' }}>3213</Box> */}
                </Box>
              </MenuItem>
              <MenuItem value={30}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box>Signatura 234 · MZK · Praha ★★ · 3/1988-4/1988</Box>
                  {/* <Box sx={{ color: 'text.secondary' }}>1999</Box> */}
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          {!allPages && (
            <ReplacementInputComponent
              label="Strany"
              viewOnly={viewOnly}
              value={replacement.pages}
              onChange={(value) => safeSetReplacement({ pages: value })}
            />
          )}
        </>
      )}
      <IconButton
        onClick={() => setMode(mode === 'MANUAL' ? 'SELECT' : 'MANUAL')}
      >
        <CompareArrowsIcon />
      </IconButton>
    </Stack>
  )
}

export default ReplacementInput
