import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import React from 'react'
import { useTranslation } from 'react-i18next'

const CalendarMainModalTableHead = () => {
  const { t } = useTranslation()
  return (
    <TableHead>
      <TableRow>
        <TableCell>{t('specimens_overview.mutation')}</TableCell>
        <TableCell>{t('specimens_overview.edition')}</TableCell>
        <TableCell>{t('specimens_overview.name')}</TableCell>
        <TableCell>{t('specimens_overview.sub_name')}</TableCell>
        <TableCell>{t('specimens_overview.owner')}</TableCell>
        <TableCell>{t('specimens_overview.digitization')}</TableCell>
        <TableCell>
          {t('specimens_overview.volume_overview_modal_link')}
        </TableCell>
        <TableCell>{t('specimens_overview.volume_detail_link')}</TableCell>
      </TableRow>
    </TableHead>
  )
}

export default CalendarMainModalTableHead
