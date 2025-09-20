import Typography from '@mui/material/Typography'
import { blue } from '@mui/material/colors'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import dayjs from 'dayjs'
import ModalContainer from '../../../components/ModalContainer'
import VolumeStatsModalContent from '../../../components/VolumeStatsModalContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import React, { FC, useMemo, useState } from 'react'
import { TMutation } from '../../../schema/mutation'
import { TOwner } from '../../../schema/owner'
import { TMetaTitle } from '../../../schema/metaTitle'
import { useTranslation } from 'react-i18next'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { TVolumeDetail } from '../../../schema/volume'
import { Link, useSearchParams } from 'react-router-dom'
import { validate as uuidValidate } from 'uuid'
import { BACK_META_TITLE_ID } from '../../../utils/constants'
import CollapsableSidebar from '../../../components/CollapsableSidebar'

interface InputDataProps {
  volume: TVolumeDetail
  volumeId: string | undefined
  mutations: TMutation[]
  owners: TOwner[]
  metaTitles: TMetaTitle[]
}

const InputData: FC<InputDataProps> = ({
  volume,
  volumeId,
  mutations,
  owners,
  metaTitles,
}) => {
  const { t, i18n } = useTranslation()
  const { languageCode } = useLanguageCode()

  const [searchParams] = useSearchParams()

  const backMetaTitle = useMemo(
    () =>
      uuidValidate(searchParams.get(BACK_META_TITLE_ID) || '')
        ? searchParams.get(BACK_META_TITLE_ID)
        : volume?.volume.metaTitleId,
    [searchParams, volume?.volume.metaTitleId]
  )

  const [modalOpened, setModalOpened] = useState(false)

  return (
    <CollapsableSidebar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // boxShadow: theme.shadows[1],
          justifyContent: 'space-between',
          flexShrink: 0,
          height: '100%',
        }}
      >
        <Typography
          sx={{
            marginBottom: '8px',
            color: blue['900'],
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          {t('volume_overview.volume_information')}
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            overflowY: 'auto',
            marginTop: '8px',
          }}
        >
          <Table
            size="small"
            sx={{ overflowY: 'auto', flexShrink: 1, flexGrow: 1 }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {t('volume_overview.name')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {t('volume_overview.value')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{t('volume_overview.meta_title')}</TableCell>
                <TableCell>
                  {
                    metaTitles.find((m) => m.id === volume.volume.metaTitleId)
                      ?.name
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.sub_name')}</TableCell>
                <TableCell>{volume.volume.subName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.mutation')}</TableCell>
                <TableCell>
                  {
                    mutations.find((m) => m.id === volume.volume.mutationId)
                      ?.name[languageCode]
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
                <TableCell>{volume.volume.mutationMark}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.bar_code')}</TableCell>
                <TableCell>{volume.volume.barCode}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.signature')}</TableCell>
                <TableCell>{volume.volume.signature}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.year')}</TableCell>
                <TableCell>{volume.volume.year}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.date_from')}</TableCell>
                <TableCell>
                  {dayjs(volume.volume.dateFrom).format('DD. MMMM YYYY')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.first_number')}</TableCell>
                <TableCell>{volume.volume.firstNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.date_to')}</TableCell>
                <TableCell>
                  {dayjs(volume.volume.dateTo).format('DD. MMMM YYYY')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.last_number')}</TableCell>
                <TableCell>{volume.volume.lastNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.owner')}</TableCell>
                <TableCell>
                  {
                    owners.find((o) => o.id === volume.volume.ownerId)
                      ?.shorthand
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.note')}</TableCell>
                <TableCell>{volume.volume.note}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Button
          sx={{
            marginTop: '10px',
            marginBottom: '10px',
            flexShrink: 0,
            flexGrow: 0,
          }}
          variant="contained"
          onClick={() => setModalOpened(true)}
        >
          {t('specimens_overview.volume_overview_modal_link')}
        </Button>
        {backMetaTitle && (
          <Button
            component={Link}
            sx={{ flexShrink: 0, flexGrow: 0 }}
            variant="outlined"
            to={`/${i18n.resolvedLanguage}/${t('urls.specimens_overview')}/${backMetaTitle}`}
          >
            {t('volume_overview.back_to_specimens_overview')}
          </Button>
        )}
        <ModalContainer
          autoWidth
          minWidth="30rem"
          onClose={() => setModalOpened(false)}
          header={t('specimens_overview.volume_overview_modal_link')}
          opened={modalOpened}
          closeButton={{
            callback: () => setModalOpened(false),
          }}
        >
          <VolumeStatsModalContent volumeId={volumeId} />
        </ModalContainer>
      </Box>
    </CollapsableSidebar>
  )
}

export default InputData
