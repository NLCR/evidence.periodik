import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { FC, useMemo, useState } from 'react'
import {
  useManagedVolumeDetailQuery,
  useVolumeOverviewStatsQuery,
} from '../../../../api/volume'
import Loader from '../../../Loader'
import ShowError from '../../../ShowError'
import { useOwnerListQuery } from '../../../../api/owner'
import { useMutationListQuery } from '../../../../api/mutation'
import { useEditionListQuery } from '../../../../api/edition'
import { useMetaTitleListQuery } from '../../../../api/metaTitle'
import { TScanTemplateSettings } from '../../schemas/schemas'
import { useFormContext } from 'react-hook-form'
import PrepareScanTemplatePreviewDialog from './PrepareScanTemplatePreviewDialog'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'

type TProps = {
  volumeId?: string
}

const PrepareScanModalContentTemplate: FC<TProps> = ({
  volumeId = undefined,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [groupByVolumes, setGroupByVolumes] = useState(false)
  const [showOnlyDoskeny, setShowOnlyDoskeny] = useState(false)
  const { watch } = useFormContext<TScanTemplateSettings>()
  const replacementSources = watch('replacementSources')

  const {
    data: owners,
    isLoading: ownersLoading,
    isError: ownersError,
  } = useOwnerListQuery()
  const {
    data: mutations,
    isLoading: mutationsLoading,
    isError: mutationsError,
  } = useMutationListQuery()
  const { data: metatitles } = useMetaTitleListQuery()
  const {
    data: editions,
    isLoading: editionsLoading,
    isError: editionsError,
  } = useEditionListQuery()

  const {
    data: volumeStats,
    isLoading: volumeStatsLoading,
    isError: volumeStatsError,
  } = useVolumeOverviewStatsQuery(volumeId)

  const { data: volume } = useManagedVolumeDetailQuery(volumeId)

  const templateItems = useMemo(
    () =>
      volume?.specimens.filter((item) => item.numExists || item.numMissing) ??
      [],
    [volume?.specimens]
  )

  const headerProps = useMemo<TTemplatePreviewHeaderProps>(
    () => ({
      title:
        metatitles?.find(
          (metaTitle) => metaTitle.id === volume?.volume?.metaTitleId
        )?.name ?? '-',
      signature: volume?.volume?.signature,
      subTitle: volume?.volume?.subName,
      owner: owners?.find((ownerItem) => ownerItem.id === volumeStats?.ownerId)
        ?.shorthand,
      mutation:
        mutations?.find(
          (mutationItem) => mutationItem.id === volume?.volume?.mutationId
        )?.name.cs ?? undefined,
      mutationEdition: volume?.volume?.mutationMark.mark ?? undefined,
      dateFrom: volume?.volume?.dateFrom
        ? new Date(volume.volume.dateFrom).toLocaleDateString()
        : '-',
      dateTo: volume?.volume?.dateTo
        ? new Date(volume.volume.dateTo).toLocaleDateString()
        : '-',
      specimensCount:
        volume?.specimens.filter((item) => !item.isAttachment).length ?? 0,
      attachmentsCount:
        volume?.specimens.filter((item) => item.isAttachment).length ?? 0,
      barCode: volumeStats?.barCode,
    }),
    [
      metatitles,
      mutations,
      owners,
      volume?.specimens,
      volume?.volume,
      volumeStats?.barCode,
      volumeStats?.ownerId,
    ]
  )

  if (
    volumeStatsLoading ||
    ownersLoading ||
    mutationsLoading ||
    editionsLoading
  )
    return <Loader />
  if (
    volumeStatsError ||
    !volumeStats ||
    ownersError ||
    !owners ||
    mutationsError ||
    !mutations ||
    editionsError ||
    !editions
  )
    return <ShowError />

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
          currentStateLabel="Aktuální stav" // TODO toto bude specialni typ - stav predlohy
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
                  checked={showOnlyDoskeny}
                  onChange={(_, checked) => setShowOnlyDoskeny(checked)}
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
              Finalizovat/dosken
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedSpecimenList
          items={templateItems}
          viewOnly={false}
          replacementSourceCandidates={replacementSources}
        />
      </Box>

      <PrepareScanTemplatePreviewDialog
        opened={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        header={headerProps}
        barCode={volumeStats.barCode}
        items={templateItems}
      />
    </Box>
  )
}

export default PrepareScanModalContentTemplate
