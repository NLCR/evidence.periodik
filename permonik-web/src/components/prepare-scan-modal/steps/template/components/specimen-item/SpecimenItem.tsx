import { useMemo } from 'react'

import { Card, CardContent, Box } from '@mui/material'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import SpecimenItemViewOnly from './SpecimenItemViewOnly'
import {
  createEmptyMainReplacement,
  TReplacement,
  TReplacementSource,
  TTemplate,
  TTemplateSpecimenRef,
} from '@/components/prepare-scan-modal/schemas/schemas'
import SpecimenItemHeader from './SpecimenItemHeader'
import SpecimenMainReplacementSection from './SpecimenMainReplacementSection'
import SpecimenNoteField from './SpecimenNoteField'
import SpecimenPageReplacementsSection from './SpecimenPageReplacementsSection'
import { getReplacementSourceCandidatesForField } from './specimenItemReplacementSourceCandidates'
import { isLockingEnabled } from '@/components/prepare-scan-modal/steps/template/utils/templateItemLocking'

type Props = {
  specimen: TTemplateSpecimenRef
  itemPath: `items.${number}`
  viewOnly?: boolean
  showOnlyRescans?: boolean
  replacementSourceCandidates: TReplacementSource[]
  disabled?: boolean
  replacementRows?: TReplacementRow[]
}

type TReplacementRow = {
  replacement: TReplacement
  replacementIndex: number
  isVisible: boolean
}

const SpecimenItem = ({
  specimen,
  itemPath,
  viewOnly = false,
  showOnlyRescans = false,
  replacementSourceCandidates,
  disabled = false,
  replacementRows: replacementRowsOverride = undefined,
}: Props) => {
  const { control } = useFormContext<TTemplate>()

  const {
    fields: replacementFields,
    append: appendReplacement,
    remove: removeReplacement,
  } = useFieldArray({ control, name: `${itemPath}.pageReplacements` })

  const mainReplacement = useWatch({
    control,
    name: `${itemPath}.mainScan.replacement`,
  })
  const pageReplacements = useWatch({
    control,
    name: `${itemPath}.pageReplacements`,
  })
  const note = useWatch({ control, name: `${itemPath}.note` }) ?? ''
  const item = useWatch({ control, name: itemPath })
  const isMainScanLocked = item ? item.mainScan.locked : false
  const templateState = useWatch({ control, name: 'state' })

  const canManageLocks = isLockingEnabled(templateState)

  const replacementRows = useMemo(
    () =>
      replacementRowsOverride ??
      pageReplacements.reduce<TReplacementRow[]>((acc, replacement, index) => {
        if (showOnlyRescans && !replacement?.isWaitingForRescan) {
          return acc
        }

        acc.push({
          replacement,
          replacementIndex: index,
          isVisible: replacement.visible,
        })

        return acc
      }, []),
    [pageReplacements, replacementRowsOverride, showOnlyRescans]
  )

  const getReplacementCandidates = (
    currentPageReplacementIndex: number | null
  ) =>
    getReplacementSourceCandidatesForField({
      replacementSources: replacementSourceCandidates,
      mainReplacement,
      pageReplacements: pageReplacements,
      activePageReplacementIndex: currentPageReplacementIndex,
    })

  const filteredMainReplacementCandidates = getReplacementCandidates(null)

  if (viewOnly)
    return (
      <SpecimenItemViewOnly
        specimen={specimen}
        mainReplacement={mainReplacement ?? createEmptyMainReplacement()}
        replacementRows={replacementRows}
        allowVisibilityChanges
        itemPath={itemPath}
        note={note ?? ''}
      />
    )

  return (
    <Card variant="outlined" sx={{ mb: 1, p: 1 }}>
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <SpecimenItemHeader
          specimen={specimen}
          itemPath={itemPath}
          canManageLocks={canManageLocks}
        />

        <SpecimenMainReplacementSection
          control={control}
          itemPath={itemPath}
          specimen={specimen}
          disabled={disabled}
          isItemLocked={isMainScanLocked}
          mainReplacement={mainReplacement}
          replacementSourceCandidates={filteredMainReplacementCandidates}
        />

        <SpecimenPageReplacementsSection
          itemPath={itemPath}
          viewOnly={viewOnly}
          showOnlyRescans={showOnlyRescans}
          disabled={disabled}
          replacementRows={replacementRows}
          replacementFields={replacementFields}
          appendReplacement={appendReplacement}
          removeReplacement={removeReplacement}
          getReplacementCandidates={getReplacementCandidates}
        />

        <Box mt={1}>
          <SpecimenNoteField
            control={control}
            itemPath={itemPath}
            disabled={disabled}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default SpecimenItem
