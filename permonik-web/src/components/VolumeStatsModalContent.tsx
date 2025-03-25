import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useVolumeOverviewStatsQuery } from '../api/volume'
import Loader from './Loader'
import ShowError from './ShowError'
import { useOwnerListQuery } from '../api/owner'
import { useMutationListQuery } from '../api/mutation'
import { useEditionListQuery } from '../api/edition'
import isFinite from 'lodash/isFinite'
import { useLanguageCode } from '../hooks/useLanguageCode'

const bolderTextStyle = {
  fontWeight: '600',
}

type TProps = {
  volumeId?: string
}

const VolumeStatsModalContent: FC<TProps> = ({ volumeId = undefined }) => {
  const { t } = useTranslation()

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
    data: editions,
    isLoading: editionsLoading,
    isError: editionsError,
  } = useEditionListQuery()

  const {
    data: volumeStats,
    isLoading: volumeStatsLoading,
    isError: volumeStatsError,
  } = useVolumeOverviewStatsQuery(volumeId)

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
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.meta_title')}:
        </Typography>
        <Typography variant="body2">{volumeStats.metaTitleName}</Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.owner')}:
        </Typography>
        <Typography variant="body2">
          {owners.find((o) => o.id === volumeStats.ownerId)?.shorthand}
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.signature')}:
        </Typography>
        <Typography variant="body2">{volumeStats.signature}</Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.bar_code')}:
        </Typography>
        <Typography variant="body2">{volumeStats.barCode}</Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.mutation')}:
        </Typography>
        {volumeStats.mutationIds.map((m) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '45%',
            }}
            key={`mutationIds-${m.name}`}
          >
            <Typography variant="body2">
              {mutations.find((mk) => mk.id === m.name)?.name[languageCode]}
            </Typography>
            <Typography variant="body2">{m.count}x</Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.year')}:
        </Typography>
        {volumeStats.publicationDayRanges.map((d) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '45%',
            }}
            key={`publicationDayRanges-${d.name}`}
          >
            <Typography variant="body2">
              {dayjs(d.name).format('YYYY')}
            </Typography>
            <Typography variant="body2">{d.count}x</Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.dates')}:
        </Typography>
        <Typography variant="body2">
          {dayjs(volumeStats.publicationDayMin).format('DD.MM.YYYY')} -{' '}
          {dayjs(volumeStats.publicationDayMax).format('DD.MM.YYYY')}
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.numbers')}:
        </Typography>
        <Typography variant="body2">
          {numbers.length ? (
            <>
              {Math.min(...numbers)} - {Math.max(...numbers)}
            </>
          ) : null}
          {numbers.length && atypicalNumbers.length ? ' | ' : null}
          {atypicalNumbers.length ? <>{atypicalNumbers.join(', ')}</> : null}
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.attachment_numbers')}:
        </Typography>
        <Typography variant="body2">
          {attachmentNumbers.length ? (
            <>
              {Math.min(...attachmentNumbers)} -{' '}
              {Math.max(...attachmentNumbers)}
            </>
          ) : null}
          {attachmentNumbers.length && atypicalAttachmentNumbers.length
            ? ' | '
            : null}
          {atypicalAttachmentNumbers.length ? (
            <>{atypicalAttachmentNumbers.join(', ')}</>
          ) : null}
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.pages_count')}:
        </Typography>
        <Typography variant="body2">{volumeStats.pagesCount}</Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.mutation_mark')}:
        </Typography>
        {volumeStats.mutationMarks.map((pm) => (
          <Box
            key={`mutationMarks-${pm.name}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '45%',
            }}
          >
            <Typography variant="body2">
              {pm.name.length ? pm.name : t('specimens_overview.without_mark')}
            </Typography>
            <Typography variant="body2">{pm.count}x</Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.edition')}:
        </Typography>
        {volumeStats.editionIds.map((p) => (
          <Box
            key={`editionIds-${p.name}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '45%',
            }}
          >
            <Typography variant="body2">
              {editions.find((pk) => pk.id === p.name)?.name[languageCode]}
            </Typography>
            <Typography variant="body2">{p.count}x</Typography>
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>{t('facet_states.OK')}:</Typography>
        <Typography variant="body2">
          {t('common.yes')}:{' '}
          {
            volumeStats.specimens.filter(
              (sp) => sp.numExists && sp.damageTypes?.find((s) => s === 'OK')
            ).length
          }
        </Typography>
        <Typography variant="body2">
          {t('common.no')}:{' '}
          {
            volumeStats.specimens.filter(
              (sp) => sp.numExists && !sp.damageTypes?.find((s) => s === 'OK')
            ).length
          }
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.damage_types_overview')}:
        </Typography>
        {volumeStats.damageTypes
          .filter((s) => s.name !== 'OK')
          .map((s) => (
            <Box
              key={`damageTypes-${s.name}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '45%',
              }}
            >
              <Typography variant="body2">
                {t(`facet_states.${s.name}`)}
              </Typography>
              <Typography variant="body2">{s.count}x</Typography>
            </Box>
          ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.missing_numbers')}:
        </Typography>
        {volumeStats.specimens
          .filter((s) => s.numMissing && !s.isAttachment)
          .map((s) => (
            <Box
              key={`missingNumbers-${s.id}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '45%',
              }}
            >
              <Typography variant="body2">{s.number}</Typography>
              <Typography variant="body2" key={`missingNumbers-child-${s.id}`}>
                {dayjs(s.publicationDate).format('DD.MM.YYYY')}
              </Typography>
            </Box>
          ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.missing_attachment_numbers')}:
        </Typography>
        {volumeStats.specimens
          .filter((s) => s.numMissing && s.isAttachment)
          .map((s) => (
            <Box
              key={`missingAttachmentNumbers-${s.id}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '45%',
              }}
            >
              <Typography variant="body2">{s.attachmentNumber}</Typography>
              <Typography
                variant="body2"
                key={`missingAttachmentNumbers-child-${s.id}`}
              >
                {dayjs(s.publicationDate).format('DD.MM.YYYY')}
              </Typography>
            </Box>
          ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.physical_condition')}:
        </Typography>
        <Typography variant="body2">
          {volumeStats.damageTypes.find((s) => s.name !== 'OK')
            ? t('volume_overview.state_not_ok')
            : t('volume_overview.state_ok')}
        </Typography>
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.damaged_numbers')}:
        </Typography>
        {volumeStats.specimens
          .filter(
            (s) =>
              s.damageTypes?.includes('PP') &&
              Number(s.number) >= 0 &&
              s.numExists
          )
          .map((s) => (
            <Box
              key={`damagedNumbers-${s.id}'`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '45%',
              }}
            >
              <Typography variant="body2">
                {dayjs(s.publicationDate).format('dd DD.MM.YYYY')}
              </Typography>
              <Typography variant="body2">
                {t('volume_overview.number').toLowerCase()} {s.number}
              </Typography>
            </Box>
          ))}
      </Box>
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <Typography sx={bolderTextStyle}>
          {t('volume_overview.notes')}:
        </Typography>
        {volumeStats.specimens
          .filter((s) => s.note.length && s.numExists)
          .map((s) => (
            <Box
              key={`notes-${s.id}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: '45px',
                }}
              >
                <Typography variant="body2">
                  {dayjs(s.publicationDate).format('dd DD.MM.YYYY')}
                </Typography>
                <Typography variant="body2">
                  {t('volume_overview.number').toLowerCase()} {s.number}
                </Typography>
              </Box>
              <Typography variant="body2">{s.note}</Typography>
            </Box>
          ))}
      </Box>
    </Box>
  )
}

export default VolumeStatsModalContent
