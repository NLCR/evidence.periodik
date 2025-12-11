import {
  GridColDef,
  GridRenderCellParams,
  GridColumnHeaderParams,
  GridAlignment,
} from '@mui/x-data-grid-pro'

import { TEditableSpecimen } from '../../schema/specimen'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { useInputDataEditabilityContext } from '../../pages/volumeManagement/components/inputData/InputDataEditabilityContextProvider'
import { useLanguageCode } from '../../hooks/useLanguageCode'
import { useEditionListQuery } from '../../api/edition'
import { random } from 'lodash'

export const useColumns = () => {
  const { t } = useTranslation()
  const { languageCode } = useLanguageCode()
  const { data: editions } = useEditionListQuery()

  const columns: GridColDef[] = useMemo(
    () => [
      // {
      //   field: 'addRow',
      //   headerName: t('volume_overview.new_row'),
      //   renderHeader: () => (
      //     <Tooltip title={t('volume_overview.new_row')}>
      //       <Box
      //         sx={{
      //           cursor: 'pointer',
      //         }}
      //         dangerouslySetInnerHTML={{
      //           __html: t('volume_overview.new_row_short'),
      //         }}
      //       />
      //     </Tooltip>
      //   ),
      //   width: 40,
      //   hideable: false,
      //   pinnable: false,
      //   disableColumnMenu: true,
      //   sortable: false,
      //   filterable: false,
      //   headerAlign: 'center',
      //   renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
      //     const { row } = params
      //     // return renderDuplicationEditCell(row)
      //     return 'asddddd'
      //   },
      // },
      {
        field: 'number',
        headerName: t('volume_overview.number'),
        renderHeader: () => (
          <Tooltip title={t('volume_overview.number')}>
            <Box
              sx={{
                cursor: 'pointer',
              }}
              dangerouslySetInnerHTML={{
                __html: t('volume_overview.number_short'),
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
      },
      {
        field: 'editionId',
        headerName: t('volume_overview.edition'),
        // renderHeader: () => (
        //   <Tooltip title={t('volume_overview.edition')}>
        //     <Box
        //       dangerouslySetInnerHTML={{
        //         __html: t('volume_overview.edition_short'),
        //       }}
        //     />
        //   </Tooltip>
        // ),
        width: 80,
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return editions?.find((m) => m.id === row.editionId)?.name[
            languageCode
          ]
        },
        valueOptions: editions?.map((v) => ({
          value: v.id,
          label: v.name[languageCode],
        })),
        type: 'singleSelect',
      },
      {
        field: 'numExists',
        headerName: `Zdroj pro skenování`,
        renderHeader: () => (
          <Tooltip title={'Zdroj pro skenování'}>
            <Box
              dangerouslySetInnerHTML={{
                __html: 'Zdroj pro <br/> skenování',
              }}
            />
          </Tooltip>
        ),
        width: 80,
        // type: '',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return <div>{row.numExists ? 'Svazek' : 'Náhrada'}</div>
        },
        // renderEditCell: renderNumExistsEditCell,
      },
      {
        field: 'note',
        headerName: `Poznámka`,

        width: 250,
        // type: '',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return (
            <div>
              {random() % 4 === 0
                ? 'náhrada jednotlivých stran nebo jiná poznámka'
                : ''}
            </div>
          )
        },
        // renderEditCell: renderNumExistsEditCell,
      },
      {
        field: 'replacement',
        headerName: `Nahradit ze svazku`,

        width: 250,
        // type: '',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<TEditableSpecimen>) => {
          const { row } = params
          return (
            <div>{row.numMissing ? 'čárový kód, číslo, vlastník...' : ''}</div>
          )
        },
        // renderEditCell: renderNumExistsEditCell,
      },
    ],
    []
  )

  return columns
}
