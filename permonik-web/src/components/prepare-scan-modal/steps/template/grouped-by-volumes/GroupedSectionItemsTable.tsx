import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getDateLabel, getNumberLabel } from '../SpecimenItem'
import { TGroupedScanSection } from '../templateGrouping'

type Props = {
  compact: boolean
  section: TGroupedScanSection
}

const GroupedSectionItemsTable: FC<Props> = ({ compact, section }) => {
  const { t } = useTranslation()
  const getPagesLabel = (value: string | null) => {
    if (!value) return t('prepare_scan_modal.content_template.all_pages_label')

    const normalizedValue = value.trim().toLowerCase()
    if (['všechny', 'vsetky', 'všetky', 'all'].includes(normalizedValue)) {
      return t('prepare_scan_modal.content_template.all_pages_label')
    }

    return value
  }

  return (
    <TableContainer>
      <Table
        size="small"
        sx={{
          '& .MuiTableCell-root': {
            borderColor: 'divider',
            px: 1,
            py: compact ? 0.5 : 0.75,
            verticalAlign: 'top',
          },
        }}
      >
        <TableHead
          sx={(theme) => ({
            '& .MuiTableCell-root': {
              fontWeight: 400,
              color: theme.palette.primary.main,
              fontSize: theme.typography.caption.fontSize,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            },
          })}
        >
          <TableRow>
            <TableCell>
              {t('prepare_scan_modal.content_template.grouped_column_number')}
            </TableCell>
            <TableCell>
              {t('prepare_scan_modal.content_template.grouped_column_pages')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {section.items.map(({ specimen, pages }, rowIndex) => (
            <TableRow
              key={`${section.key}-${specimen.id}-${rowIndex}`}
              sx={{
                '&:last-child .MuiTableCell-root': {
                  borderBottom: 'none',
                },
              }}
            >
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 600 }}>
                    {getNumberLabel(specimen, t)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    (
                    {specimen.publicationDate
                      ? getDateLabel(specimen.publicationDate)
                      : '-'}
                    )
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>{getPagesLabel(pages)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default GroupedSectionItemsTable
