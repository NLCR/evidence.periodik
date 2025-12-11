import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  useManagedVolumeDetailQuery,
  useVolumeOverviewStatsQuery,
} from '../../api/volume'
import Loader from '../Loader'
import ShowError from '../ShowError'
import { useOwnerListQuery } from '../../api/owner'
import { useMutationListQuery } from '../../api/mutation'
import { useEditionListQuery } from '../../api/edition'
import isFinite from 'lodash/isFinite'
import { useLanguageCode } from '../../hooks/useLanguageCode'
import Barcode from 'react-barcode'
import { useMetaTitleListQuery } from '../../api/metaTitle'
import { StripedDataGrid } from '../../pages/volumeManagement/components/SpecimensTable'
import { useColumns } from './columns'

const bolderTextStyle = {
  fontWeight: '600',
}

type TProps = {
  volumeId?: string
}

const PrepareScanModalContent: FC<TProps> = ({ volumeId = undefined }) => {
  const { t } = useTranslation()

  const columns = useColumns()

  const { languageCode } = useLanguageCode()

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

  const numbers = useMemo(
    () =>
      volumeStats?.specimens
        .filter(
          (s) =>
            s.numExists &&
            !s.isAttachment &&
            s.number?.length &&
            isFinite(Number(s.number))
        )
        .map((s) => Number(s.number)) || [],
    [volumeStats?.specimens]
  )

  const atypicalNumbers = useMemo(
    () =>
      volumeStats?.specimens
        .filter(
          (s) =>
            s.numExists &&
            !s.isAttachment &&
            s.number?.length &&
            !isFinite(Number(s.number)) &&
            /^[0-9]+[a-zA-Z]+$/.test(s.number)
        )
        .map((s) => s.number) || [],
    [volumeStats?.specimens]
  )

  const attachmentNumbers = useMemo(
    () =>
      volumeStats?.specimens
        .filter(
          (s) =>
            s.numExists &&
            s.isAttachment &&
            s.attachmentNumber?.length &&
            isFinite(Number(s.attachmentNumber))
        )
        .map((s) => Number(s.attachmentNumber)) || [],
    [volumeStats?.specimens]
  )

  const atypicalAttachmentNumbers = useMemo(
    () =>
      volumeStats?.specimens
        .filter(
          (s) =>
            s.numExists &&
            s.isAttachment &&
            s.attachmentNumber?.length &&
            !isFinite(Number(s.attachmentNumber)) &&
            /^[0-9]+[a-zA-Z]+$/.test(s.attachmentNumber)
        )
        .map((s) => s.attachmentNumber) || [],
    [volumeStats?.specimens]
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
          ({volume?.volume?.signature ?? 'neznámmá signatura'})
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr">
          <Typography>Podnázev: {volume?.volume.subName}</Typography>
          <Typography>
            Vlastník:{' '}
            {owners.find((o) => o.id === volumeStats.ownerId)?.shorthand}
          </Typography>
          <Typography>
            Mutace:{' '}
            {mutations.find((m) => m.id === volume?.volume.mutationId)?.name.cs}
          </Typography>
          <Typography>
            Mutační vydání: {volume?.volume.mutationMark.mark}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center">
          <Barcode value={volumeStats.barCode} />
        </Box>
      </Box>
      <StripedDataGrid
        columns={columns}
        rows={volume?.specimens.filter(
          (item) => item.numExists || item.numMissing
        )}
      />
      {/* 
      TODO:
       - dat jen data kde je numExists nebo numMissing
       - zavest entitu
       - vytahnout zakladni informace z volume.specimens
       - pridat poznamku
       - povoleni pridani sloupcu? Radku? Jak ukladat na BE?
         - array?
       
       - nahled na predlohu ke skenovani do badatelske casti?
       */}
    </Box>
  )
}

export default PrepareScanModalContent
