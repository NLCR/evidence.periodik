import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import { TReplacement, TReplacementSource } from './schemas'
import IconButton from '@mui/material/IconButton'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import {
  mapSelectOptionToReplacement,
  normalizeReplacement,
  TReplacementSelectOption,
} from './utils/replacementInput'

type TCommonProps = {
  allPages?: boolean
  viewOnly?: boolean
  selectOptions?: TReplacementSelectOption[]
}

type TReplacementValueProps = {
  valueType?: 'replacement'
  value: TReplacement | null
  onChange: (value: TReplacement) => void
}

type TReplacementSourceValueProps = {
  valueType: 'source'
  value: TReplacementSource | null
  onChange: (value: TReplacementSource) => void
}

type Props = TCommonProps &
  (TReplacementValueProps | TReplacementSourceValueProps)

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
  selectOptions = [],
  ...props
}: Props) => {
  const replacement = normalizeReplacement(value)

  const [mode, setMode] = useState<'SELECT' | 'MANUAL'>('SELECT')
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')

  const safeSetReplacement = (nextPartial: Partial<TReplacement>) => {
    const nextReplacement = {
      ...replacement,
      ...nextPartial,
    }

    if (props.valueType === 'source') {
      const { pages, ...replacementSource } = nextReplacement
      void pages
      props.onChange(replacementSource)
      return
    }

    props.onChange(nextReplacement)
  }

  const handleSelectChange = (selectedId: string) => {
    setSelectedOptionId(selectedId)

    const selectedOption = selectOptions.find(
      (option) => option.id === selectedId
    )
    if (!selectedOption) return

    const mappedReplacement = mapSelectOptionToReplacement(
      selectedOption,
      replacement
    )

    if (props.valueType === 'source') {
      const { pages, ...replacementSource } = mappedReplacement
      void pages
      props.onChange(replacementSource)
      return
    }

    props.onChange(mappedReplacement)
  }

  return (
    <Stack
      direction="row"
      gap={1}
      width={'100%'}
      justifyContent={'space-evenly'}
      alignItems={'center'}
    >
      {viewOnly || mode === 'MANUAL' ? (
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
            <InputLabel id="replacement-select-label">
              Vyberte náhradní svazek
            </InputLabel>
            <Select
              fullWidth
              labelId="replacement-select-label"
              id="replacement-select"
              value={selectedOptionId}
              label="Vyberte náhradní svazek"
              onChange={(event) =>
                handleSelectChange(String(event.target.value))
              }
            >
              {selectOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Box>{option.label}</Box>
                  </Box>
                </MenuItem>
              ))}
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
      {!viewOnly && (
        <IconButton
          onClick={() => setMode(mode === 'MANUAL' ? 'SELECT' : 'MANUAL')}
        >
          <CompareArrowsIcon />
        </IconButton>
      )}
    </Stack>
  )
}

export default ReplacementInput
