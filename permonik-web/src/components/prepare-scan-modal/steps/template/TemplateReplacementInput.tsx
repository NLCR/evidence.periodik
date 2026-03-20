import Stack from '@mui/material/Stack'
import { ReactNode, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Box from '@mui/material/Box'
import ReplacementInputComponent from '../common/ReplacementInputComponent'
import { TReplacementSource, TTemplateReplacement } from '../../schemas/schemas'

type Props = {
  allPages?: boolean
  viewOnly?: boolean
  value?: TTemplateReplacement | null
  onChange: (value: TTemplateReplacement) => void
  candidates?: TReplacementSource[]
}

const emptyTemplateReplacement: TTemplateReplacement = {
  volume: {
    id: undefined,
    signature: '',
    owner: '',
    barcode: '',
    mutation: '',
    mutationEdition: '',
  },
  pages: 'všechny',
  isUnreplaceable: false,
  isWaitingForRescan: false,
}

const TemplateReplacementInput = ({
  allPages = undefined,
  viewOnly = false,
  value = null,
  onChange,
  candidates = [],
}: Props) => {
  const replacement = value ?? emptyTemplateReplacement

  const [mode, setMode] = useState<'SELECT' | 'MANUAL'>('SELECT')
  const [selectedOptionId, setSelectedOptionId] = useState<string>('')

  const setVolumeField = (
    key: 'signature' | 'owner' | 'barcode' | 'mutation' | 'mutationEdition',
    fieldValue: string
  ) => {
    onChange({
      ...replacement,
      volume: {
        ...replacement.volume,
        [key]: fieldValue,
      },
    })
  }

  const handleSelectChange = (selectedId: string) => {
    setSelectedOptionId(selectedId)

    const selectedOption = candidates.find((option) => option.id === selectedId)
    if (!selectedOption) return

    onChange({
      ...replacement,
      volume: {
        id: selectedOption.id,
        signature: selectedOption.signature,
        owner: selectedOption.owner,
        barcode: selectedOption.barcode,
        mutation: selectedOption.mutation,
        mutationEdition: selectedOption.mutationEdition,
      },
    })
  }

  const buildReplacementOptionLabel = (option: TReplacementSource): ReactNode =>
    `${option.signature} - ${option.owner} (${option.barcode})`

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
            value={replacement.volume.signature}
            onChange={(next) => setVolumeField('signature', next)}
            fullWidth
          />
          <ReplacementInputComponent
            label="Vlastník"
            viewOnly={viewOnly}
            value={replacement.volume.owner}
            onChange={(next) => setVolumeField('owner', next)}
            fullWidth
          />
          <ReplacementInputComponent
            label="Čárový kód"
            viewOnly={viewOnly}
            value={replacement.volume.barcode}
            onChange={(next) => setVolumeField('barcode', next)}
            fullWidth
          />
          <ReplacementInputComponent
            label="Mutace"
            viewOnly={viewOnly}
            value={replacement.volume.mutation}
            onChange={(next) => setVolumeField('mutation', next)}
            fullWidth
          />
          <ReplacementInputComponent
            label="Mutační vydání"
            viewOnly={viewOnly}
            value={replacement.volume.mutationEdition}
            onChange={(next) => setVolumeField('mutationEdition', next)}
            fullWidth
          />
          {!allPages && (
            <ReplacementInputComponent
              label="Strany"
              viewOnly={viewOnly}
              value={replacement.pages}
              onChange={(next) => onChange({ ...replacement, pages: next })}
              fullWidth
            />
          )}
        </Box>
      ) : (
        <>
          <FormControl fullWidth>
            <InputLabel id="template-replacement-select-label">
              Vyberte náhradní svazek
            </InputLabel>
            <Select
              fullWidth
              labelId="template-replacement-select-label"
              id="template-replacement-select"
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
              onChange={(next) => onChange({ ...replacement, pages: next })}
            />
          )}
        </>
      )}
      {!viewOnly && (
        <Box flexGrow={0}>
          <IconButton
            onClick={() => {
              setMode(mode === 'MANUAL' ? 'SELECT' : 'MANUAL')
              onChange({
                ...emptyTemplateReplacement,
                isUnreplaceable: replacement.isUnreplaceable,
                isWaitingForRescan: replacement.isWaitingForRescan,
              })
            }}
          >
            <CompareArrowsIcon />
          </IconButton>
        </Box>
      )}
    </Stack>
  )
}

export default TemplateReplacementInput
