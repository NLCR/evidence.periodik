import Stack from '@mui/material/Stack'
import { ReactNode, useState } from 'react'
import {
  emptyReplacement,
  TReplacement,
  TReplacementSource,
} from '../../schemas/commonSchemas'
import IconButton from '@mui/material/IconButton'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import ReplacementInputComponent from './ReplacementInputComponent'

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

  function buildReplacementOptionLabel(option: TReplacementSource): ReactNode {
    return `${option.signature} - ${option.owner} (${option.barcode})`
  }

  return (
    <Stack
      direction="row"
      gap={1}
      width={'100%'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      {viewOnly || mode === 'MANUAL' ? (
        <Box
          display={'flex'}
          flexDirection={'row'}
          gap={1}
          alignItems={'center'}
          width={'100%'}
          flexGrow={1}
          justifyContent={'space-between'}
        >
          <ReplacementInputComponent
            label="Signatura"
            viewOnly={viewOnly}
            value={replacement.signature}
            onChange={(value) => safeSetReplacement({ signature: value })}
            fullWidth
          />
          <ReplacementInputComponent
            label="Vlastník"
            viewOnly={viewOnly}
            value={replacement.owner}
            onChange={(value) => safeSetReplacement({ owner: value })}
            fullWidth
          />
          <ReplacementInputComponent
            label="Čárový kód"
            viewOnly={viewOnly}
            value={replacement.barcode}
            onChange={(value) => safeSetReplacement({ barcode: value })}
            fullWidth
          />
          <ReplacementInputComponent
            label="Mutace"
            viewOnly={viewOnly}
            value={replacement.mutation}
            onChange={(value) => safeSetReplacement({ mutation: value })}
            fullWidth
          />
          <ReplacementInputComponent
            label="Mutační vydání"
            viewOnly={viewOnly}
            value={replacement.mutationEdition}
            onChange={(value) => safeSetReplacement({ mutationEdition: value })}
            fullWidth
          />
          {!allPages && (
            <ReplacementInputComponent
              label="Strany"
              viewOnly={viewOnly}
              value={replacement.pages}
              onChange={(value) => safeSetReplacement({ pages: value })}
              fullWidth
            />
          )}
        </Box>
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
        <Box flexGrow={0}>
          <IconButton
            onClick={() => {
              setMode(mode === 'MANUAL' ? 'SELECT' : 'MANUAL')
              safeSetReplacement(emptyReplacement)
            }}
          >
            <CompareArrowsIcon />
          </IconButton>
        </Box>
      )}
    </Stack>
  )
}

export default ReplacementInput
