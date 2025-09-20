import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GridColDef,
  GridRenderCellParams,
  DataGridPro,
} from '@mui/x-data-grid-pro'
import dayjs from 'dayjs'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { blue, green, grey, orange, red } from '@mui/material/colors'
import { TFunction } from 'i18next'
import { TMetaTitle } from '../../../schema/metaTitle'
import { useMutationListQuery } from '../../../api/mutation'
import { useEditionListQuery } from '../../../api/edition'
import { useOwnerListQuery } from '../../../api/owner'
import { useSpecimenListQuery } from '../../../api/specimen'
import { TSpecimen } from '../../../schema/specimen'
import { damageTypes } from '../../../utils/constants'
import { useSpecimensOverviewStore } from '../../../slices/useSpecimensOverviewStore'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import VolumeStatsModalContent from '../../../components/VolumeStatsModalContent'
import ModalContainer from '../../../components/ModalContainer'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { useMuiTableLang } from '../../../hooks/useMuiTableLang'
import { generateVolumeUrlWithParams } from '../../../utils/generateVolumeUrlWithParams'

const getSpecimenState = (sp: TSpecimen, t: TFunction) => {
  if (sp.damageTypes) {
    if (!sp.damageTypes.length) {
      return (
        <Tooltip title={t('tooltip_states.uncontrolled')}>
          <Box
            sx={(theme) => ({
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              border: `1px solid ${theme.palette.grey['700']}`,
              backgroundColor: grey['100'],
            })}
          />
        </Tooltip>
      )
    }
    if (sp.damageTypes.includes('ChS')) {
      return (
        <Tooltip title={t('tooltip_states.missing_page')}>
          <Box
            sx={(theme) => ({
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              border: `1px solid ${theme.palette.grey['700']}`,
              backgroundColor: red['700'],
            })}
          />
        </Tooltip>
      )
    }
    if (sp.damageTypes.some((st) => damageTypes.includes(st) && st !== 'OK')) {
      return (
        <Tooltip title={t('tooltip_states.damaged_document')}>
          <Box
            sx={(theme) => ({
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              border: `1px solid ${theme.palette.grey['700']}`,
              backgroundColor: orange['700'],
            })}
          />
        </Tooltip>
      )
    }

    return (
      <Tooltip title={t('tooltip_states.complete')}>
        <Box
          sx={(theme) => ({
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            border: `1px solid ${theme.palette.grey['700']}`,
            backgroundColor: green['700'],
          })}
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip title={t('tooltip_states.uncontrolled')}>
      <Box
        sx={(theme) => ({
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          border: `1px solid ${theme.palette.grey['700']}`,
          backgroundColor: theme.palette.grey['100'],
        })}
      />
    </Tooltip>
  )
}

const OwnersBarCodeCell: FC<{
  row: TSpecimen
  ownerId: string
  setModalData: (row: TSpecimen) => void
}> = ({ row, ownerId, setModalData }) => {
  const { t, i18n } = useTranslation()

  const { metaTitleId } = useParams()

  return row.ownerId === ownerId ? (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
      }}
    >
      <Box
        sx={{
          textDecoration: 'none',
          color: blue['700'],
          transition: 'color 0.1s',
          ':hover': {
            color: blue['900'],
          },
          cursor: 'pointer',
        }}
        onClick={() => setModalData(row)}
      >
        {row.barCode}
      </Box>
      <Box
        sx={{
          textDecoration: 'none',
          color: blue['700'],
          transition: 'color 0.1s',
          ':hover': {
            color: blue['900'],
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        component={RouterLink}
        to={generateVolumeUrlWithParams(
          `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${
            row.volumeId
          }`,
          metaTitleId || '',
          row.id
        )}
      >
        <DriveFileMoveOutlinedIcon />
      </Box>
      <Box>{getSpecimenState(row, t)}</Box>
    </Box>
  ) : undefined
}

type Props = {
  metaTitle: TMetaTitle
}

const Table: FC<Props> = ({ metaTitle }) => {
  const { t, i18n } = useTranslation()
  const { MuiTableLocale } = useMuiTableLang()
  const navigate = useNavigate()

  const [modalData, setModalData] = useState<TSpecimen | null>(null)

  const pagination = useSpecimensOverviewStore((state) => state.pagination)
  const setPagination = useSpecimensOverviewStore(
    (state) => state.setPagination
  )

  const { data: mutations } = useMutationListQuery()
  const { data: editions } = useEditionListQuery()
  const { data: owners } = useOwnerListQuery()
  const { languageCode } = useLanguageCode()

  const {
    data: specimens,
    isFetching: specimensFetching,
    // isError: specimensError,
  } = useSpecimenListQuery(metaTitle.id)

  const columns = useMemo<GridColDef<TSpecimen>[]>(() => {
    return [
      {
        field: 'mutationId',
        headerName: t('table.mutations'),
        valueFormatter: (value) => {
          return mutations?.find((m) => m.id === value)?.name[languageCode]
        },
      },
      {
        field: 'publicationDate',
        headerName: t('table.publication_date'),
        flex: 1,
        valueFormatter: (value) => {
          return dayjs(value).format('dd DD.MM.YYYY')
        },
      },
      {
        field: 'name',
        headerName: t('table.name'),
      },
      {
        field: 'editionId',
        headerName: t('table.edition'),
        valueFormatter: (value) => {
          return editions?.find((m) => m.id === value)?.name[languageCode]
        },
      },
      {
        field: 'number',
        headerName: t('table.number'),
      },
      {
        field: 'pagesCount',
        headerName: t('table.pages_count'),
      },
      ...(owners
        ? owners
            .filter((o) => specimens?.owners.includes(o.id))
            .map((o) => ({
              field: `owner${o.id}`,
              flex: 1,
              headerName: o.shorthand,
              renderCell: (params: GridRenderCellParams<TSpecimen>) => {
                const { row } = params
                return (
                  <OwnersBarCodeCell
                    row={row}
                    ownerId={o.id}
                    setModalData={setModalData}
                  />
                )
              },
            }))
        : []),
    ]
  }, [t, owners, mutations, languageCode, editions, specimens?.owners])

  return (
    <>
      <DataGridPro
        localeText={MuiTableLocale}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pagination.pageSize,
              page: pagination.pageIndex,
            },
          },
          density: 'compact',
        }}
        disableColumnFilter
        disableColumnSorting
        rows={specimens?.specimens || []}
        rowCount={specimens?.count || 0}
        paginationMode="server"
        loading={specimensFetching}
        onPaginationModelChange={(model) =>
          setPagination({ pageSize: model.pageSize, pageIndex: model.page })
        }
        columns={columns}
        pagination
        pageSizeOptions={[100, 1000, 5000, 10000]}
        disableRowSelectionOnClick
      />
      <ModalContainer
        autoWidth
        minWidth="30rem"
        onClose={() => {
          setModalData(null)
        }}
        closeButton={{
          callback: () => {
            setModalData(null)
          },
        }}
        acceptButton={{
          callback: () => {
            if (modalData?.volumeId) {
              navigate(
                generateVolumeUrlWithParams(
                  `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${
                    modalData.volumeId
                  }`,
                  modalData.metaTitleId || '',
                  modalData.id
                )
              )
            }
          },
          text: t('specimens_overview.detailed_volume_overview'),
        }}
        opened={!!modalData}
        header={`${t('specimens_overview.volume_overview_modal_link')} ${modalData?.barCode}`}
      >
        <VolumeStatsModalContent volumeId={modalData?.volumeId} />
      </ModalContainer>
    </>
  )
}

export default Table
