import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { FC, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { TReplacementSource, TTemplate } from '../../schemas/schemas'
import PrepareScanTemplatePreviewDialog from './PrepareScanTemplatePreviewDialog'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'

type TProps = {
  volumeId?: string
  replacementSources?: TReplacementSource[]
}

const PrepareScanModalContentTemplate: FC<TProps> = ({
  replacementSources = [],
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [groupByVolumes, setGroupByVolumes] = useState(false)
  const [showOnlyRescans, setShowOnlyRescans] = useState(false)
  const { control } = useFormContext<TTemplate>()
  const primaryVolume = useWatch({ control, name: 'primaryVolume' })
  const watchedItems = useWatch({ control, name: 'items' })
  const watchedState = useWatch({ control, name: 'state' })
  const items = useMemo(() => watchedItems ?? [], [watchedItems])

  const headerProps = useMemo<TTemplatePreviewHeaderProps>(
    () => ({
      title: primaryVolume?.metaTitleId ?? '-',
      signature: primaryVolume?.signature,
      subTitle: primaryVolume?.subName,
      owner: primaryVolume?.ownerId,
      mutation: primaryVolume?.mutationId,
      mutationEdition: primaryVolume?.mutationMark.mark ?? undefined,
      dateFrom: primaryVolume?.dateFrom
        ? new Date(primaryVolume.dateFrom).toLocaleDateString()
        : '-',
      dateTo: primaryVolume?.dateTo
        ? new Date(primaryVolume.dateTo).toLocaleDateString()
        : '-',
      specimensCount: items.filter((item) => !item.specimen.attachmentNumber)
        .length,
      attachmentsCount: items.filter((item) => !!item.specimen.attachmentNumber)
        .length,
    }),
    [items, primaryVolume]
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <TemplatePreviewHeader
          {...headerProps}
          displayCurrentState
          currentState={watchedState}
        />

        <Box display="flex" justifyContent="space-between" marginTop={0.25}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={groupByVolumes}
                  onChange={(_, checked) => setGroupByVolumes(checked)}
                />
              }
              label="Seskupit po svazcích"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyRescans}
                  onChange={(_, checked) => setShowOnlyRescans(checked)}
                />
              }
              label="Zobrazit pouze doskeny"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setIsPreviewOpen(true)}>
              Zobrazit náhled
            </Button>
            <Button
              variant="outlined"
              onClick={() => alert('TODO validace pro finalizaci')}
            >
              Validovat
            </Button>
            <Button
              variant="contained"
              onClick={() => alert('TODO zmeny stavu')}
            >
              {items.some(
                (item) =>
                  item.replacement?.isWaitingForRescan ||
                  item.pageReplacements.some((r) => r.isWaitingForRescan)
              )
                ? 'Uzavřít k doskenování'
                : 'Finalizovat'}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedSpecimenList
          items={items}
          viewOnly={false}
          replacementSourceCandidates={replacementSources}
          showOnlyRescans={showOnlyRescans}
          groupByVolumes={groupByVolumes}
        />
      </Box>

      <PrepareScanTemplatePreviewDialog
        opened={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        header={headerProps}
        barCode={primaryVolume?.barCode}
        items={items}
        showOnlyRescans={showOnlyRescans}
        groupByVolumes={groupByVolumes}
      />
    </Box>
  )
}

export default PrepareScanModalContentTemplate
