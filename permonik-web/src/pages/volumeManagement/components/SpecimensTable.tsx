import { FC, RefObject, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  gridClasses,
  GridColDef,
  GridRenderCellParams,
  DataGridPro,
  GridColumnHeaderParams,
  useGridApiRef,
  GridApiPro,
  GridAlignment,
} from '@mui/x-data-grid-pro'
import Box from '@mui/material/Box'
import { alpha, styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import {
  GridCellParams,
  GridRenderEditCellParams,
} from '@mui/x-data-grid/models/params/gridCellParams'
import { blue } from '@mui/material/colors'
import {
  TEditableSpecimen,
  TSpecimenDamageTypes,
} from '../../../schema/specimen'
import { useVolumeManagementStore } from '../../../slices/useVolumeManagementStore'
import { TMutation } from '../../../schema/mutation'
import { TEdition } from '../../../schema/edition'
import DamagedAndMissingPagesEditCell from './editCells/DamagedAndMissingPagesEditCell'
import DamageTypesEditCell from './editCells/DamageTypesEditCell'
import MutationMarkSelectorModalContainer from './editCells/MutationMarkSelectorModalContainer'
import RenumberableValueCell from './editCells/RenumberableValueCell'
import HeaderWithColumnAction from './editCells/HeaderWithColumnAction'
import { useSearchParams } from 'react-router-dom'
import { JUMP_TO_SPECIMEN_WITH_ID } from '../../../utils/constants'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { useMuiTableLang } from '../../../hooks/useMuiTableLang'
import { checkAttachmentChange, filterSpecimen } from '../../../utils/specimen'
import { validate as uuidValidate } from 'uuid'
import TableHeader from './TableHeader'
import Tooltip from '@mui/material/Tooltip'
import DuplicationEditCell from './editCells/DuplicationEditCell'
import DeletionEditCell from './editCells/DeletionEditCell'
import { useShallow } from 'zustand/shallow'
import { useInputDataEditabilityContext } from './inputData/InputDataEditabilityContextProvider'

const ODD_OPACITY = 0.2

export const StripedDataGrid = styled(DataGridPro)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity
      ),
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
            theme.palette.action.selectedOpacity +
            theme.palette.action.hoverOpacity
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity
          ),
        },
      },
    },
  },
  [`& .${gridClasses.row}`]: {
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  },
  [`& .${gridClasses.row}.attachment`]: {
    backgroundColor: blue[100],
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
  },
  ['& .MuiDataGrid-columnHeader']: {
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 4,
    paddingRight: 4,
  },
})) as typeof DataGridPro

const renderCheckBox = (
  checked: boolean,
  show: boolean,
  canEdit: boolean,
  color: 'primary' | 'success' = 'primary'
) => {
  return show ? (
    <Checkbox color={color} checked={checked} readOnly disabled={!canEdit} />
  ) : null
}

const renderValue = (
  value: string | number | undefined | null,
  show: boolean,
  canEdit: boolean
) => {
  return show ? (
    <Box
      sx={(theme) => ({
        color: canEdit ? theme.palette.grey[900] : theme.palette.grey[600],
      })}
    >
      {value}
    </Box>
  ) : null
}

const renderRenumberableValue = (
  row: TEditableSpecimen,
  show: boolean,
  canEdit: boolean,
  type: 'number' | 'attachmentNumber',
  apiRef: RefObject<GridApiPro | null>
) => {
  return (
    <RenumberableValueCell
      row={row}
      show={show}
      canEdit={canEdit}
      type={type}
      apiRef={apiRef}
    />
  )
}

const renderHeaderWithColumnAction = (
  field: TSpecimenDamageTypes,
  canEdit: boolean,
  apiRef: RefObject<GridApiPro | null>,
  headerName: string,
  description: string
) => {
  return (
    <HeaderWithColumnAction
      field={field}
      canEdit={canEdit}
      apiRef={apiRef}
      headerName={headerName}
      description={description}
    />
  )
}

const renderDamagedAndMissingPagesEditCell = (
  params: GridRenderEditCellParams<TEditableSpecimen>
) => {
  return <DamagedAndMissingPagesEditCell {...params} />
}

const renderDamageTypesEditCell = (
  params: GridRenderEditCellParams<TEditableSpecimen>
) => {
  return <DamageTypesEditCell {...params} />
}

const renderMutationMarkEditCell = (
  params: GridRenderEditCellParams<TEditableSpecimen>
) => {
  return <MutationMarkSelectorModalContainer {...params} />
}

const renderDuplicationEditCell = (
  row: TEditableSpecimen,
  canEdit: boolean
) => {
  return <DuplicationEditCell row={row} canEdit={canEdit} />
}

const renderDeletionEditCell = (row: TEditableSpecimen, canEdit: boolean) => {
  return <DeletionEditCell row={row} canEdit={canEdit} />
}

interface TableProps {
  mutations: TMutation[]
  editions: TEdition[]
}

const Table: FC<TableProps> = ({ mutations, editions }) => {
  const { languageCode } = useLanguageCode()
  const { MuiTableLocale } = useMuiTableLang()
  const { t } = useTranslation()
  const apiRef = useGridApiRef()
  const { disabled, locked: isInputDataLocked } =
    useInputDataEditabilityContext()

  const [searchParams] = useSearchParams()

  const scrolledToRow = useRef<boolean>(false)

  const stateHasUnsavedData = useVolumeManagementStore(
    useShallow((state) => state.stateHasUnsavedData)
  )
  const specimenActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const specimensState = useVolumeManagementStore(
    (state) => state.specimensState
  )

  useEffect(() => {
    const timeout = undefined
    if (
      !scrolledToRow.current &&
      apiRef.current &&
      uuidValidate(searchParams.get(JUMP_TO_SPECIMEN_WITH_ID) || '')
    ) {
      const rowIndex = specimensState.findIndex(
        (s) => s.id === searchParams.get(JUMP_TO_SPECIMEN_WITH_ID)
      )

      if (rowIndex >= 0) {
        setTimeout(() => {
          apiRef.current?.scrollToIndexes({ rowIndex: rowIndex })
          scrolledToRow.current = true
        }, 250)
      }
    }
    return () => clearTimeout(timeout)
  }, [apiRef, searchParams, specimensState])

  const columns: GridColDef<TEditableSpecimen>[] = [
    {
      field: 'publicationDate',
      headerName: t('table.publication_date'),
      width: 110,
      filterable: false,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(
          dayjs(row.publicationDate).format('dd DD.MM.YYYY'),
          true,
          !disabled
        )
      },
    },
    {
      field: 'newRow',
      headerName: t('volume_overview.new_row'),
      renderHeader: () => (
        <Tooltip title={t('volume_overview.new_row')}>
          <Box
            sx={{
              cursor: 'pointer',
            }}
            dangerouslySetInnerHTML={{
              __html: t('volume_overview.new_row_short'),
            }}
          />
        </Tooltip>
      ),
      width: 40,
      hideable: false,
      pinnable: false,
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderDuplicationEditCell(row, !disabled)
      },
    },
    ...(!stateHasUnsavedData && specimensState.length
      ? [
          {
            field: 'deleteRow',
            headerName: t('volume_overview.delete_row'),
            renderHeader: () => (
              <Tooltip title={t('volume_overview.delete_row')}>
                <Box
                  sx={{
                    cursor: 'pointer',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: t('volume_overview.delete_row_short'),
                  }}
                />
              </Tooltip>
            ),
            width: 40,
            pinnable: false,
            sortable: false,
            filterable: false,
            headerAlign: 'center' as GridAlignment,
            renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
              const { row } = params
              return renderDeletionEditCell(row, !disabled)
            },
          },
        ]
      : []),
    {
      field: 'numExists',
      headerName: t('volume_overview.is_in_volume'),
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
      type: 'boolean',
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(row.numExists, true, !disabled)
      },
    },
    {
      field: 'numMissing',
      headerName: t('volume_overview.missing_number'),
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
      type: 'boolean',
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(row.numMissing, true, !disabled)
      },
    },
    {
      field: 'number',
      headerName: t('volume_overview.number'),
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
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderRenumberableValue(
          row,
          (row.numExists || row.numMissing) && !row.isAttachment,
          !disabled,
          'number',
          apiRef
        )
      },
    },
    {
      field: 'attachmentNumber',
      headerName: t('volume_overview.attachment_number'),
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
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderRenumberableValue(
          row,
          (row.numExists || row.numMissing) && row.isAttachment,
          !disabled,
          'attachmentNumber',
          apiRef
        )
      },
      // renderEditCell: renderAttachmentNumberEditCell,
    },
    {
      field: 'mutationId',
      headerName: t('volume_overview.mutation'),
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
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(
          mutations.find((m) => m.id === row.mutationId)?.name[languageCode],
          row.numExists,
          !disabled
        )
      },
      valueOptions: mutations.map((v) => ({
        value: v.id,
        label: v.name[languageCode],
      })),
      type: 'singleSelect',
    },
    {
      field: 'editionId',
      headerName: t('volume_overview.edition'),
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
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(
          editions.find((m) => m.id === row.editionId)?.name[languageCode],
          row.numExists,
          !disabled
        )
      },
      valueOptions: editions.map((v) => ({
        value: v.id,
        label: v.name[languageCode],
      })),
      type: 'singleSelect',
    },
    {
      field: 'name',
      headerName: t('volume_overview.name'),
      renderHeader: () => (
        <Tooltip title={t('volume_overview.name')}>
          <Box
            dangerouslySetInnerHTML={{
              __html: t('volume_overview.name_short'),
            }}
          />
        </Tooltip>
      ),
      type: 'string',
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(row.name, row.numExists, !disabled)
      },
      // width: 1,
    },
    {
      field: 'subName',
      headerName: t('volume_overview.sub_name'),
      renderHeader: () => (
        <Tooltip title={t('volume_overview.sub_name')}>
          <Box
            dangerouslySetInnerHTML={{
              __html: t('volume_overview.sub_name_short'),
            }}
          />
        </Tooltip>
      ),
      type: 'string',
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(row.subName, row.numExists, !disabled)
      },
      // width: 1,
    },
    {
      field: 'pagesCount',
      headerName: t('volume_overview.pages_count'),
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
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(row.pagesCount, row.numExists, !disabled)
      },
    },
    {
      /* bug fix, with the right name it hasn't updated value */
      field: 'mutationMark2',
      headerName: t('volume_overview.mutation_mark'),
      renderHeader: () => (
        <Tooltip title={t('volume_overview.mutation_mark')}>
          <Box
            dangerouslySetInnerHTML={{
              __html: t('volume_overview.mutation_mark_short'),
            }}
          />
        </Tooltip>
      ),
      type: 'string',
      width: 60,
      editable: !disabled,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(row.mutationMark, row.numExists, !disabled)
      },
      renderEditCell: renderMutationMarkEditCell,
    },
    {
      field: 'OK',
      headerName: t('facet_states_short.OK_tooltip'),
      renderHeader: (params: GridColumnHeaderParams<TEditableSpecimen>) => {
        const { field } = params
        return renderHeaderWithColumnAction(
          field as TSpecimenDamageTypes,
          !disabled,
          apiRef,
          t('facet_states_short.OK'),
          t('facet_states_short.OK_tooltip')
        )
      },
      width: 52,
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('OK'),
          row.numExists,
          !disabled,
          'success'
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'PP',
      headerName: t('facet_states_short.PP_tooltip'),
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
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('PP'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamagedAndMissingPagesEditCell,
    },
    {
      field: 'Deg',
      headerName: t('facet_states_short.Deg_tooltip'),
      renderHeader: (params: GridColumnHeaderParams<TEditableSpecimen>) => {
        const { field } = params
        return renderHeaderWithColumnAction(
          field as TSpecimenDamageTypes,
          !disabled,
          apiRef,
          t('facet_states_short.Deg'),
          t('facet_states_short.Deg_tooltip')
        )
      },
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      width: 52,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('Deg'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'ChS',
      headerName: t('facet_states_short.ChS_tooltip'),
      renderHeader: () => (
        <Tooltip title={t('facet_states_short.ChS_tooltip')}>
          <Box
            dangerouslySetInnerHTML={{
              __html: t('facet_states_short.ChS'),
            }}
          />
        </Tooltip>
      ),
      width: 52,
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('ChS'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamagedAndMissingPagesEditCell,
    },
    {
      field: 'ChPag',
      headerName: t('facet_states_short.ChPag_tooltip'),
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
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('ChPag'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'ChDatum',
      headerName: t('facet_states_short.ChDatum_tooltip'),
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
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('ChDatum'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'ChCis',
      headerName: t('facet_states_short.ChCis_tooltip'),
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
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('ChCis'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'ChSv',
      headerName: t('facet_states_short.ChSv_tooltip'),
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
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('ChSv'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'NS',
      headerName: t('facet_states_short.NS_tooltip'),
      renderHeader: (params: GridColumnHeaderParams<TEditableSpecimen>) => {
        const { field } = params
        return renderHeaderWithColumnAction(
          field as TSpecimenDamageTypes,
          !disabled,
          apiRef,
          t('facet_states_short.NS'),
          t('facet_states_short.NS_tooltip')
        )
      },
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      width: 52,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('NS'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'Cz',
      headerName: t('facet_states_short.Cz_tooltip'),
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
      type: 'boolean',
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderCheckBox(
          !!row.damageTypes?.includes('Cz'),
          row.numExists,
          !disabled
        )
      },
      renderEditCell: renderDamageTypesEditCell,
    },
    {
      field: 'note',
      type: 'string',
      // width: 100,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
        const { row } = params
        return renderValue(row.note, row.numExists, !disabled)
      },
      headerName: t('volume_overview.note'),
      editable: !disabled,
      filterable: false,
      disableColumnMenu: true,
    },
  ]

  const handleUpdate = (newRow: TEditableSpecimen) => {
    const row = checkAttachmentChange(editions, newRow)
    // console.log(row)
    specimenActions.setSpecimen(row)
    return filterSpecimen(row)
  }

  const isCellEditable = (params: GridCellParams<TEditableSpecimen>) => {
    const { row, field } = params

    if (disabled) return false
    if (field === 'publicationDate') return false

    const hasNumValue = row.numExists || row.numMissing

    const editableFields: Record<string, boolean> = {
      numExists: !row.numMissing,
      numMissing: !row.numExists,
      number: !row.isAttachment && hasNumValue,
      attachmentNumber: row.isAttachment && hasNumValue,
    }

    return editableFields[field] ?? row.numExists

    // if (field === 'numExists') {
    //   return canEdit && !row.numMissing
    // }
    // if (field === 'numMissing') {
    //   return canEdit && !row.numExists
    // }
    // if (field === 'publicationDate') {
    //   return false
    // }
    // if (field === 'number') {
    //   return canEdit && !row.isAttachment && (row.numMissing || row.numExists)
    // }
    // if (field === 'attachmentNumber') {
    //   return canEdit && row.isAttachment && (row.numMissing || row.numExists)
    // }
    // if (!row.numExists) {
    //   return false
    // }
    //
    // return canEdit
  }

  return (
    <>
      <TableHeader apiRef={apiRef} />
      <StripedDataGrid
        sx={isInputDataLocked ? {} : { opacity: 0.5, pointerEvents: 'none' }}
        columnHeaderHeight={65}
        apiRef={apiRef}
        localeText={MuiTableLocale}
        getRowClassName={(params) => {
          let classes =
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
          if (params.row.isAttachment) {
            classes += ' attachment'
          }
          return classes
        }}
        rows={specimensState}
        columns={columns}
        initialState={{
          density: 'compact',
          pinnedColumns: { left: ['publicationDate'] },
        }}
        disableRowSelectionOnClick
        disableColumnSorting
        isCellEditable={isCellEditable}
        processRowUpdate={handleUpdate}
        hideFooter
        // onCellClick={(params) => {
        //   // do not attempt to enter edit mode where not applicable
        //   if (params.cellMode === 'edit' || !params.isEditable) return

        //   // stop editing all other rows
        //   const rowIds = params.api.getAllRowIds()
        //   rowIds.forEach((rowId) => {
        //     try {
        //       params.api.stopRowEditMode({ id: rowId })
        //     } catch (e) {
        //       // pass
        //     }
        //   })
        //   // start editing this row
        //   params.api.startRowEditMode({ id: params.row.id })
        // }}
        editMode="row"
      />
    </>
  )
}

export default Table
