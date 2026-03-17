import Stack from '@mui/material/Stack'
import { useState } from 'react'
import { emptyReplacement, TReplacement, TReplacementSource } from './schemas'
import IconButton from '@mui/material/IconButton'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import ReplacementInputComponent from './ReplacementInputComponent'
import { buildReplacementOptionLabel } from './utils/replacementInput'

type Props = {
  allPages?: boolean
  viewOnly?: boolean
  value?: TReplacement | null
  onChange: (value: TReplacement) => void
  candidates?: TReplacementSource[]
}

const ReplacementInput = ({
  allPages = undefined,
  viewOnly = false,
  value = null,
  onChange,
  candidates = [],
}: Props) => {
  const replacement = value ?? emptyReplacement

  const [mode, setMode] = useState<'SELECT' | 'MANUAL'>('SELECT')
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')

  const safeSetReplacement = (nextPartial: Partial<TReplacement>) => {
    onChange({
      ...replacement,
      ...nextPartial,
    })
  }

  const handleSelectChange = (selectedId: string) => {
    setSelectedOptionId(selectedId)

    const selectedOption = candidates.find((option) => option.id === selectedId)
    if (!selectedOption) return

    onChange({
      ...replacement,
      ...selectedOption,
      pages: replacement.pages,
    })
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
              {candidates.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Box>{buildReplacementOptionLabel(option)}</Box>
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
