import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
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
import Barcode from 'react-barcode'
import { useMetaTitleListQuery } from '../../../../api/metaTitle'
import { TabSelect } from '../../../TabSelect'
import { TScanTemplateSettings } from '../../schemas'
import { useFormContext } from 'react-hook-form'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'

type TProps = {
  volumeId?: string
}

type TView = 'VIEW' | 'EDIT'

const PrepareScanModalContentTemplate: FC<TProps> = ({
  volumeId = undefined,
}) => {
  const [view, setView] = useState<TView>('EDIT')
  const [filter, setFilter] = useState<'1' | '2'>('1')
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
  const {
    data: metatitles,
    isLoading: metatitlesLoading,
    isError: metatitlesError,
  } = useMetaTitleListQuery()
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

  const {
    data: volume,
    isLoading: volumeLoading,
    isError: volumeError,
  } = useManagedVolumeDetailQuery(volumeId)

  const templateItems = useMemo(
    () =>
      volume?.specimens.filter((item) => item.numExists || item.numMissing) ??
      [],
    [volume?.specimens]
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
    <Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          {metatitles?.find((m) => m.id === volume?.volume?.metaTitleId)?.name}{' '}
          (signatura {volume?.volume?.signature ?? 'neznámmá signatura'})
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={5}>
          <Box>
            <Typography>Podnázev: {volume?.volume.subName}</Typography>
            <Typography>
              Vlastník:{' '}
              {owners.find((o) => o.id === volumeStats.ownerId)?.shorthand}
            </Typography>
            <Typography>
              Mutace:{' '}
              {
                mutations.find((m) => m.id === volume?.volume.mutationId)?.name
                  .cs
              }
            </Typography>
            <Typography>
              Mutační vydání: {volume?.volume.mutationMark.mark}
            </Typography>
          </Box>
          <Box>
            <Typography>
              Rozsah od:{' '}
              {new Date(volume?.volume.dateFrom ?? '').toLocaleDateString()}
            </Typography>

            <Typography>
              Rozsah do:{' '}
              {new Date(volume?.volume.dateTo ?? '').toLocaleDateString()}
            </Typography>
            <Typography>
              Počet čísel:{' '}
              {volume?.specimens.filter((item) => !item.isAttachment).length}
            </Typography>
            <Typography>
              Počet příloh:{' '}
              {volume?.specimens.filter((item) => item.isAttachment).length}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="center">
          <Barcode value={volumeStats.barCode} />
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          Zobrazení:{' '}
          <TabSelect<TView>
            options={[
              { label: 'Editace', value: 'EDIT' },
              { label: 'Náhled', value: 'VIEW' },
            ]}
            selectedItem={view}
            setSelectedItem={setView}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={4}
          marginTop={2}
        >
          Pohled:{' '}
          <TabSelect<'1' | '2'>
            options={[
              { label: 'Po číslech', value: '1' },
              { label: 'Po svazcích', value: '2' },
            ]}
            selectedItem={filter}
            setSelectedItem={setFilter}
          />
        </Box>
      </Box>

      <VirtualizedSpecimenList
        items={templateItems}
        viewOnly={view === 'VIEW'}
        replacementSourceCandidates={replacementSources}
      />
    </Box>
  )
}

export default PrepareScanModalContentTemplate
