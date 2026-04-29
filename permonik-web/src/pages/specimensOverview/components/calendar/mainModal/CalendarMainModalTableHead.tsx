import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { useTranslation } from 'react-i18next'

const CalendarMainModalTableHead = () => {
  const { t } = useTranslation()
  return (
    <TableHead>
      <TableRow>
        <TableCell>{t('common.fields.mutation')}</TableCell>
        <TableCell>{t('specimens_overview.edition')}</TableCell>
        <TableCell>{t('specimens_overview.name')}</TableCell>
        <TableCell>{t('common.fields.sub_name')}</TableCell>
        <TableCell>{t('common.fields.owner')}</TableCell>
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
