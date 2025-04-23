import Typography from '@mui/material/Typography'
import { blue } from '@mui/material/colors'
import Box from '@mui/material/Box'
import React, { FC, MutableRefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useManagedVolumeDetailQuery } from '../../../api/volume'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { GridApiPro, GridEventListener, GridState } from '@mui/x-data-grid-pro'

type TableHeaderProps = {
  apiRef: MutableRefObject<GridApiPro>
}

const TableHeader: FC<TableHeaderProps> = ({ apiRef }) => {
  const { volumeId } = useParams()
  const { t } = useTranslation()

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
    return apiRef.current.subscribeEvent('stateChange', handleFilterChange)
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
          color: blue['900'],
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
            {`${t('volume_overview.volume_created_at')}: ${data?.volume?.created?.length && dayjs(data.volume.created).isValid() ? dayjs(data.volume.created).format('DD.MM.YYYY HH:mm:ss') : '---'}`}
          </Typography>
          <Typography>
            {`${t('volume_overview.volume_updated_at')}: ${data?.volume?.updated?.length && dayjs(data.volume.updated).isValid() ? dayjs(data.volume.updated).format('DD.MM.YYYY HH:mm:ss') : '---'}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default TableHeader
