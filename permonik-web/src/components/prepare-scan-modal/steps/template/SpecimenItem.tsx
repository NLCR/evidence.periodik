import React, { useEffect } from 'react'
import dayjs from 'dayjs'

import CheckIcon from '@mui/icons-material/Check'
import PlusIcon from '@mui/icons-material/Add'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import SpecimenItemViewOnly from './SpecimenItemViewOnly'
import FormCheckbox from '../../../form/FormCheckbox'
import {
  EMPTY_REPLACEMENT,
  EMPTY_REPLACEMENT_SOURCE,
  TReplacementSource,
  TTemplate,
  TTemplateSpecimenRef,
} from '../../schemas/schemas'
import ReplacementSourceInput from '../common/ReplacementSourceInput'
import ReplacementInput from '../common/ReplacementInput'
import { getReplacementSourceCandidatesForField } from './specimenItemReplacementSourceCandidates'

type Props = {
  specimen: TTemplateSpecimenRef
  itemPath: `items.${number}`
  viewOnly?: boolean
  showOnlyRescans?: boolean
  replacementSourceCandidates: TReplacementSource[]
  disabled?: boolean
}

export const getNumberLabel = (specimen: TTemplateSpecimenRef) => {
  if (specimen.number) return `č. ${specimen.number}`
  if (specimen.attachmentNumber)
    return `Příloha č. ${specimen.attachmentNumber}`
  return 'Neznámé číslo'
}

export const getDateLabel = (date: string) => dayjs(date).format('DD. MM. YYYY')

const AddReplacementButton = ({
  callback,
  disabled = false,
}: {
  callback: () => void
  disabled?: boolean
}) => (
  <Button
    variant="outlined"
    startIcon={<PlusIcon />}
    onClick={callback}
    disabled={disabled}
  >
    Přidat náhradu
  </Button>
)

const SpecimenItem = ({
  specimen,
  itemPath,
  viewOnly = false,
  showOnlyRescans = false,
  replacementSourceCandidates,
  disabled = false,
}: Props) => {
  const { control, setValue } = useFormContext<TTemplate>()

  const {
    fields: replacementFields,
    append: appendReplacement,
    remove,
  } = useFieldArray({ control, name: `${itemPath}.pageReplacements` })

  const mainReplacement = useWatch({
    control,
    name: `${itemPath}.replacement`,
  })
  const replacements = useWatch({
    control,
    name: `${itemPath}.pageReplacements`,
  })
  const note = useWatch({ control, name: `${itemPath}.note` })

  useEffect(() => {
    if (viewOnly || !specimen.numMissing || mainReplacement) return

    setValue(`${itemPath}.replacement`, EMPTY_REPLACEMENT)
  }, [itemPath, mainReplacement, setValue, specimen.numMissing, viewOnly])

  const visibleReplacementIndexes =
    showOnlyRescans && replacements
      ? replacements.reduce<number[]>((acc, replacement, index) => {
          if (replacement?.isWaitingForRescan) acc.push(index)
          return acc
        }, [])
      : replacementFields.map((_, index) => index)

  const visibleReplacements =
    showOnlyRescans && replacements
      ? replacements.filter((replacement) => replacement?.isWaitingForRescan)
      : replacements

  const getReplacementCandidates = (
    currentPageReplacementIndex: number | null
  ) =>
    getReplacementSourceCandidatesForField({
      replacementSources: replacementSourceCandidates,
      mainReplacement,
      pageReplacements: replacements,
      activePageReplacementIndex: currentPageReplacementIndex,
    })

  const filteredMainReplacementCandidates = getReplacementCandidates(null)

  if (viewOnly)
    return (
      <SpecimenItemViewOnly
        specimen={specimen}
        mainReplacement={mainReplacement ?? EMPTY_REPLACEMENT}
        replacements={visibleReplacements ?? []}
        note={note ?? ''}
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
            (
            {specimen.publicationDate
              ? getDateLabel(specimen.publicationDate)
              : '-'}
            )
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
                <Controller
                  control={control}
                  name={`${itemPath}.replacement.volume`}
                  render={({ field, fieldState }) => (
                    <ReplacementSourceInput
                      viewOnly={viewOnly}
                      value={field.value ?? EMPTY_REPLACEMENT_SOURCE}
                      candidates={filteredMainReplacementCandidates}
                      onChange={field.onChange}
                      errorMessage={fieldState.error?.message}
                      disabled={disabled}
                    />
                  )}
                />
              </Stack>
              <Stack direction={'row'} gap={8}>
                <Box>
                  <FormCheckbox<TTemplate>
                    name={`${itemPath}.replacement.isUnreplaceable` as const}
                    label="Náhrada není dostupná"
                    disabled={disabled}
                  />
                </Box>
                <Box>
                  <FormCheckbox<TTemplate>
                    name={`${itemPath}.replacement.isWaitingForRescan` as const}
                    label="Čeká na dosken"
                    disabled={disabled}
                  />
                </Box>
              </Stack>
            </>
          )}
        </Box>

        <Box mt={1} paddingLeft={3}>
          <Stack spacing={1} alignItems="flex-start">
            {visibleReplacements.length > 0 ? (
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
                  {visibleReplacementIndexes.map((index) => {
                    const item = replacementFields[index]

                    if (!item) return null

                    return (
                      <ReplacementInput
                        includePageSelect
                        key={item.id}
                        name={`${itemPath}.pageReplacements.${index}`}
                        index={index}
                        viewOnly={viewOnly}
                        replacementSourceCandidates={getReplacementCandidates(
                          index
                        )}
                        onRemove={remove}
                        disabled={disabled}
                      />
                    )
                  })}
                  <AddReplacementButton
                    disabled={disabled}
                    callback={() => appendReplacement(EMPTY_REPLACEMENT)}
                  />
                </Stack>
              </Box>
            ) : (
              !showOnlyRescans && (
                <AddReplacementButton
                  disabled={disabled}
                  callback={() => appendReplacement(EMPTY_REPLACEMENT)}
                />
              )
            )}
          </Stack>
        </Box>

        <Box mt={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Poznámka: </Typography>
            <Controller
              control={control}
              name={`${itemPath}.note`}
              render={({ field }) => (
                <TextField
                  variant="standard"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={disabled}
                />
              )}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SpecimenItem
