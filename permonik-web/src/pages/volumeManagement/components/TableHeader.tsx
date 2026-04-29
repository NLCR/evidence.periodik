import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import React, { FC, RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useManagedVolumeDetailQuery } from '../../../api/volume'
import { useParams } from 'react-router-dom'
import { GridApiPro, GridEventListener, GridState } from '@mui/x-data-grid-pro'
import theme from '../../../theme'
import { useFormatDate } from '../../../utils/date'

type TableHeaderProps = {
  apiRef: RefObject<GridApiPro | null>
}

const TableHeader: FC<TableHeaderProps> = ({ apiRef }) => {
  const { volumeId } = useParams()
  const { t } = useTranslation()
  const { formatDate } = useFormatDate()

  const { data } = useManagedVolumeDetailQuery(volumeId)

  const [filter, setFilter] = useState({ rowCount: 0, active: false })

  useEffect(() => {
    const handleFilterChange: GridEventListener<'stateChange'> = (
      params: GridState
    ) => {
      setFilter({
        rowCount: params.pagination.rowCount,
        active: !!params.filter.filterModel.items.length,
      })
    }
    return apiRef.current?.subscribeEvent('stateChange', handleFilterChange)
  }, [apiRef])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}
    >
      <Typography
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          fontSize: '24px',
        }}
      >
        {t('volume_overview.volume_description')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: '20px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '2px',
            paddingRight: '8px',
          }}
        >
          <Typography>
            {`${t('volume_overview.rows_count')}: ${data?.specimens.length ? data.specimens.length : '---'}`}
          </Typography>
          <Typography>
            {`${t('volume_overview.filtered_rows_count')}: ${filter.active ? filter.rowCount : '---'} `}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '2px',
            paddingRight: '8px',
          }}
        >
          <Typography>
            {`${t('volume_overview.volume_created_at')}: ${formatDate(data?.volume?.created, { includeTime: true })}`}
          </Typography>
          <Typography>
            {`${t('volume_overview.volume_updated_at')}: ${formatDate(data?.volume?.updated, { includeTime: true })}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default TableHeader
