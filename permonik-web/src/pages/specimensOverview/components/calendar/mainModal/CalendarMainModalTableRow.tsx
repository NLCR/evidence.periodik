import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import React, { Dispatch, SetStateAction } from 'react'
import { generateVolumeUrlWithParams } from '../../../../../utils/generateVolumeUrlWithParams'
import { TSpecimen } from '../../../../../schema/specimen'
import { TMutation } from '../../../../../schema/mutation'
import { TEdition } from '../../../../../schema/edition'
import { useLanguageCode } from '../../../../../hooks/useLanguageCode'
import { useTranslation } from 'react-i18next'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import { TOwner } from '../../../../../schema/owner'
import { Link as ReactLink, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { TLibrarySpecimenIds } from '../models'
import ky from 'ky'
import LibraryExternalLink from './LibraryExternalLink'
import theme from '../../../../../theme'

type Props = {
  specimen: TSpecimen
  mutations: TMutation[] | undefined
  editions: TEdition[] | undefined
  owners: TOwner[] | undefined
  setSubModalData: Dispatch<SetStateAction<TSpecimen | null>>
}

const CalendarMainModalTableRow = ({
  specimen,
  mutations,
  editions,
  owners,
  setSubModalData,
}: Props) => {
  const { metaTitleId } = useParams()
  const { languageCode } = useLanguageCode()
  const { t, i18n } = useTranslation()

  const specimenIdsQuery = useQuery<TLibrarySpecimenIds>({
    queryKey: ['knihovny.cz', specimen.barCode],
    queryFn: async () => {
      return await ky
        .get(
          `https://www.knihovny.cz/api/v1/search?join=AND&lookfor0[]=${
            specimen.barCode
          }&type0[]=adv_search_barcodes&bool0[]=AND&daterange[]=publishDate_facet_mv&publishDate_facet_mvfrom=&publishDate_facet_mvto=&limit=20&field[]=dedupIds`
        )
        .json<TLibrarySpecimenIds>()
    },
  })

  return (
    <TableRow>
      <TableCell>
        {
          mutations?.find((m) => m.id === specimen.mutationId)?.name[
            languageCode
          ]
        }
      </TableCell>
      <TableCell>
        {editions?.find((p) => p.id === specimen.editionId)?.name[languageCode]}
      </TableCell>
      <TableCell>{specimen.name}</TableCell>
      <TableCell
        sx={{
          maxWidth: '300px',
        }}
      >
        {specimen.subName}
      </TableCell>
      <TableCell>
        <LibraryExternalLink
          isLoading={specimenIdsQuery.isLoading}
          isError={specimenIdsQuery.isError}
          libraryIds={specimenIdsQuery.data?.records?.[0]?.dedupIds}
          owners={owners}
          ownerId={specimen.ownerId}
        />
      </TableCell>
      <TableCell />
      <TableCell>
        <Typography
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: theme.palette.primary.light,
            transition: 'color 0.1s',
            ':hover': {
              color: theme.palette.primary.main,
            },
          }}
          onClick={() => {
            setSubModalData(specimen)
          }}
        >
          {t('specimens_overview.open')}
          <DriveFileMoveOutlinedIcon
            sx={{
              marginLeft: '3px',
            }}
          />
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          component={ReactLink}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: theme.palette.primary.light,
            transition: 'color 0.1s',
            ':hover': {
              color: theme.palette.primary.main,
            },
          }}
          to={generateVolumeUrlWithParams(
            `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${
              specimen.volumeId
            }`,
            metaTitleId || '',
            specimen.id
          )}
        >
          {specimen.barCode}{' '}
          <DriveFileMoveOutlinedIcon
            sx={{
              marginLeft: '3px',
            }}
          />
        </Typography>
      </TableCell>
    </TableRow>
  )
}

export default CalendarMainModalTableRow
