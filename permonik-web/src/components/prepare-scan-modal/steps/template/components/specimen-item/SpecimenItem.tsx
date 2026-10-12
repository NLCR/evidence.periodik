import { useMemo } from 'react'

import { Card, CardContent, Box } from '@mui/material'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import SpecimenItemViewOnly from './SpecimenItemViewOnly'
import {
  createEmptyMainReplacement,
  type TReplacement,
  type TReplacementSource,
  type TTemplate,
  type TTemplateSpecimen,
  ResolutionStatus,
} from '@/components/prepare-scan-modal/schemas/schemas'
import SpecimenItemHeader from './SpecimenItemHeader'
import SpecimenMainReplacementSection from './SpecimenMainReplacementSection'
import SpecimenNoteField from './SpecimenNoteField'
import SpecimenPageReplacementsSection from './SpecimenPageReplacementsSection'
import { isLockingEnabled } from '@/components/prepare-scan-modal/steps/template/utils/templateItemLocking'

type Props = {
  specimen: TTemplateSpecimen
  itemPath: `items.${number}`
  viewOnly?: boolean
  showOnlyRescans?: boolean
  showOnlyUnlocked?: boolean
  replacementSourceCandidates: TReplacementSource[]
  disabled?: boolean
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
  showOnlyUnlocked = false,
  replacementSourceCandidates,
  disabled = false,
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
      pageReplacements
        .reduce<TReplacementRow[]>((acc, replacement, index) => {
          if (
            showOnlyRescans &&
            replacement.status !== ResolutionStatus.WAITING_FOR_RESCAN
          ) {
            return acc
          }
          if (showOnlyUnlocked && replacement.locked) return acc

          acc.push({
            replacement,
            replacementIndex: index,
            isVisible: replacement.visible,
          })

          return acc
        }, [])
        .filter(
          ({ replacement }) =>
            viewOnly || !showOnlyUnlocked || !replacement.locked
        ),
    [pageReplacements, showOnlyRescans, showOnlyUnlocked, viewOnly]
  )

  const filteredMainReplacementCandidates = replacementSourceCandidates

  if (viewOnly)
    return (
      <SpecimenItemViewOnly
        specimen={specimen}
        isMainReplacement={item?.mainScan.type === 'REPLACEMENT'}
        mainScanVisible={item?.mainScan.visible ?? false}
        showHiddenTasks
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
          isMainReplacement={item?.mainScan.type === 'REPLACEMENT'}
          showOnlyUnlocked={showOnlyUnlocked}
          disabled={disabled}
          isItemLocked={isMainScanLocked}
          mainReplacement={mainReplacement}
          replacementSourceCandidates={filteredMainReplacementCandidates}
        />

        <SpecimenPageReplacementsSection
          itemPath={itemPath}
          viewOnly={viewOnly}
          showOnlyRescans={showOnlyRescans}
          showOnlyUnlocked={showOnlyUnlocked}
          disabled={disabled}
          replacementRows={replacementRows}
          replacementFields={replacementFields}
          appendReplacement={appendReplacement}
          removeReplacement={removeReplacement}
          getReplacementCandidates={() => replacementSourceCandidates}
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
