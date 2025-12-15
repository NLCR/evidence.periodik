import React, { useState } from 'react'
import { TSpecimen } from '../../schema/specimen'
import dayjs from 'dayjs'

import CheckIcon from '@mui/icons-material/Check'
import PlusIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Checkbox,
} from '@mui/material'
import ReplacementInput from './ReplacementInput'
import SpecimenItemViewOnly from './SpecimenItemViewOnly'
import { defaultReplacement, TReplacement } from './schemas'

type Props = { specimen: TSpecimen; viewOnly?: boolean }

export const getNumberLabel = (specimen: TSpecimen) => {
  if (specimen.number) return `č. ${specimen.number}`
  if (specimen.attachmentNumber)
    return `Příloha č. ${specimen.attachmentNumber}`
  return 'Neznámé číslo'
}

export const getDateLabel = (date: string) => dayjs(date).format('DD. MM. YYYY')

const AddReplacementButton = ({ callback }: { callback: () => void }) => (
  <Button variant="outlined" startIcon={<PlusIcon />} onClick={callback}>
    Přidat náhradu
  </Button>
)

const SpecimenItem = ({ specimen, viewOnly = false }: Props) => {
  const [replacements, setReplacements] = useState<TReplacement[]>([])
  const addReplacement = () =>
    setReplacements((prev) => prev.concat([defaultReplacement]))
  const removeReplacement = (index: number) =>
    setReplacements((prev) => prev.filter((item, idx) => idx != index))

  const [note, setNote] = useState<string>('')
  const [mainReplacement, setMainReplacement] = useState<TReplacement | null>(
    null
  )

  if (viewOnly)
    return (
      <SpecimenItemViewOnly
        specimen={specimen}
        mainReplacement={mainReplacement}
        replacements={replacements}
        note={note}
      />
    )

  return (
    <Card variant="outlined" sx={{ mb: 1, p: 1 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 140 }}>
            {getNumberLabel(specimen)}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            ({getDateLabel(specimen.publicationDate)})
          </Typography>
        </Stack>

        <Box mt={1}>
          {specimen.numExists ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckIcon color="success" fontSize="small" />
              <Typography>Skenovat ze svazku</Typography>
            </Stack>
          ) : (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningIcon color="error" fontSize="small" />
                <Typography>Nahradit:</Typography>
                <ReplacementInput
                  allPages
                  viewOnly={viewOnly}
                  onChange={setMainReplacement}
                  value={mainReplacement}
                />
              </Stack>
              <Box>
                <Checkbox /> Náhrada není dostupná
              </Box>
            </>
          )}
        </Box>

        <Box mt={1} paddingLeft={3}>
          <Stack spacing={1} alignItems="flex-start">
            {replacements.length > 0 ? (
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                  width: '100%',
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography sx={{ mb: 1, fontWeight: 600 }}>
                  Náhrady:
                </Typography>

                <Stack spacing={1}>
                  {replacements.map((item, index) => (
                    <>
                      <Stack key={index} direction="row" alignItems="center">
                        <ReplacementInput
                          viewOnly={viewOnly}
                          value={replacements[index]}
                          onChange={(value: TReplacement) =>
                            setReplacements((prev) => {
                              prev[index] = value
                              return prev
                            })
                          }
                        />
                        <IconButton onClick={() => removeReplacement(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                      <Box>
                        <Checkbox /> Náhrada není dostupná
                      </Box>
                    </>
                  ))}
                  <AddReplacementButton callback={addReplacement} />
                </Stack>
              </Box>
            ) : (
              <AddReplacementButton callback={addReplacement} />
            )}
          </Stack>
        </Box>

        <Box mt={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Poznámka: </Typography>
            <TextField
              variant="standard"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SpecimenItem
