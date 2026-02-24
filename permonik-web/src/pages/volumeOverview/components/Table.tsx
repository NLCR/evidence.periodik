/* eslint-disable react/prop-types */
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import { TEditableSpecimen, TSpecimen } from '../../../schema/specimen'
import { TVolumeDetail } from '../../../schema/volume'
import { useMutationListQuery } from '../../../api/mutation'
import { useEditionListQuery } from '../../../api/edition'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { useMuiTableLang } from '../../../hooks/useMuiTableLang'
import Tooltip from '@mui/material/Tooltip'
import { StripedDataGrid } from '../../volumeManagement/components/SpecimensTable'
import { getMutationMarkLabel } from '../../../utils/mutationMark'
import { useFormatDate } from '../../../utils/date'

type TProps = {
  volume?: TVolumeDetail
}

const CenteredIcon = (show: boolean) => {
  return show ? (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <CheckIcon />
    </Box>
  ) : null
}

const renderValue = (
  value: string | number | undefined | null,
  show: boolean
) => {
  return show ? value : null
}

const Table: FC<TProps> = ({ volume = undefined }) => {
  const { MuiTableLocale } = useMuiTableLang()
  const { data: mutations } = useMutationListQuery()
  const { data: editions } = useEditionListQuery()
  const { languageCode } = useLanguageCode()
  const { t } = useTranslation()
  const { formatDate } = useFormatDate()

  const columns = useMemo<GridColDef<TSpecimen>[]>(() => {
    return [
      {
        field: 'publicationDate',
        headerName: t('table.publication_date'),
        width: 110,
        filterable: false,
        headerAlign: 'center',
        valueFormatter: (value) => {
          return formatDate(value, { includeDayName: true })
        },
      },
      {
        field: 'numExists',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.is_in_volume')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.is_in_volume_short'),
              }}
            />
          </Tooltip>
        ),
        width: 50,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(row.numExists)
        },
      },
      {
        field: 'numMissing',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.missing_number')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.missing_number_short'),
              }}
            />
          </Tooltip>
        ),
        width: 50,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(row.numMissing)
        },
      },
      {
        field: 'number',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.number')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.number_short'),
              }}
            />
          </Tooltip>
        ),
        width: 50,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return renderValue(
            row.number,
            (row.numExists || row.numMissing) && !row.isAttachment
          )
        },
      },
      {
        field: 'attachmentNumber',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.attachment_number')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.attachment_number_short'),
              }}
            />
          </Tooltip>
        ),
        width: 60,
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(
            row.attachmentNumber,
            row.numExists && row.isAttachment
          )
        },
      },
      {
        field: 'mutationId',
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.mutation')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.mutation_short'),
              }}
            />
          </Tooltip>
        ),
        width: 60,
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(
            mutations?.find((m) => m.id === row.mutationId)?.name[languageCode],
            row.numExists
          )
        },
      },
      {
        field: 'editionId',
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.edition')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.edition_short'),
              }}
            />
          </Tooltip>
        ),
        width: 50,
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(
            editions?.find((m) => m.id === row.editionId)?.name[languageCode],
            row.numExists
          )
        },
      },
      {
        field: 'name',
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.name')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.name_short'),
              }}
            />
          </Tooltip>
        ),
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(row.name, row.numExists)
        },
      },
      {
        field: 'subName',
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.sub_name')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.sub_name_short'),
              }}
            />
          </Tooltip>
        ),
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(row.subName, row.numExists)
        },
      },
      {
        field: 'pagesCount',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.pages_count')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.pages_count_short'),
              }}
            />
          </Tooltip>
        ),
        width: 50,
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(row.pagesCount, row.numExists)
        },
      },
      {
        field: 'mutationMark',
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('volume_overview.mutation_mark')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.mutation_mark_short'),
              }}
            />
          </Tooltip>
        ),
        width: 60,
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(
            getMutationMarkLabel(row.mutationMark),
            row.numExists
          )
        },
      },
      {
        field: 'damageTypes-reviewed',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.OK_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.OK'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('OK') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-damaged_pages',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.PP_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.PP'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          const damageExists =
            !!row.damageTypes?.includes('PP') && row.numExists

          const damagedPages = row.damagedPages
          if (damagedPages.length > 0) {
            return renderValue(
              [...damagedPages].sort().toString(),
              damageExists
            )
          }
          return CenteredIcon(damageExists)
        },
      },
      {
        field: 'damageTypes-degradation',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.Deg_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.Deg'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('Deg') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-missing_pages',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.ChS_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.ChS'),
              }}
            />
          </Tooltip>
        ),
        width: 64,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          const damageExists =
            !!row.damageTypes?.includes('ChS') && row.numExists

          const missingPages = row.missingPages
          if (missingPages.length > 0) {
            return renderValue(
              [...missingPages].sort().toString(),
              damageExists
            )
          }
          return CenteredIcon(damageExists)
        },
      },
      {
        field: 'damageTypes-bad_pagination',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.ChPag_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.ChPag'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('ChPag') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-bad_date',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.ChDatum_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.ChDatum'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('ChDatum') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-bad_numbering',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.ChCis_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.ChCis'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('ChCis') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-bad_bound',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.ChSv_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.ChSv'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('ChSv') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-unreadable_bound',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.NS_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.NS'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('NS') && row.numExists
          )
        },
      },
      {
        field: 'damageTypes-censored',
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderHeader: () => (
          <Tooltip title={t('facet_states_short.Cz_tooltip')}>
            <Box
              dangerouslySetInnerHTML={{
                __html: t('facet_states_short.Cz'),
              }}
            />
          </Tooltip>
        ),
        width: 52,
        renderCell: (params: GridRenderCellParams<TSpecimen>) => {
          const { row } = params
          return CenteredIcon(
            !!row.damageTypes?.includes('Cz') && row.numExists
          )
        },
      },
      {
        field: 'note',
        headerName: t('volume_overview.note'),
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return renderValue(row.note, row.numExists)
        },
      },
    ]
  }, [languageCode, mutations, editions, t, formatDate])

  return (
    <StripedDataGrid
      columnHeaderHeight={60}
      getRowClassName={(params) => {
        let classes =
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        if (params.row.isAttachment) {
          classes += ' attachment'
        }
        return classes
      }}
      localeText={MuiTableLocale}
      rows={volume?.specimens}
      columns={columns}
      initialState={{
        density: 'compact',
        pinnedColumns: { left: ['publicationDate'] },
      }}
      disableRowSelectionOnClick
      disableColumnSorting
    />
  )
}

export default Table
