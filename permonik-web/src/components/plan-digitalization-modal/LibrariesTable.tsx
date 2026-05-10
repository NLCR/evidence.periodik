import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FillIndexIndicator from '../FillIndexIndicator'
import { PlanDigitalizationResponse } from './schemas'

type Props = {
  data: PlanDigitalizationResponse
}

const LibrariesTable: FC<Props> = ({ data }) => {
  const { t } = useTranslation()

  const libraryColumns = useMemo(() => {
    const map = new Map<string, { id: string; shorthand: string }>()

    data.forEach((yearItem) => {
      yearItem.libraries.forEach((library) => {
        if (!map.has(library.id)) {
          map.set(library.id, { id: library.id, shorthand: library.shorthand })
        }
      })
    })

    return Array.from(map.values())
  }, [data])

  const fillIndexSums = useMemo(() => {
    const sums = new Map<string, number>()

    data.forEach((yearItem) => {
      yearItem.libraries.forEach((library) => {
        const currentSum = sums.get(library.id) ?? 0
        const librarySum = library.volumes.reduce(
          (sum, volume) => sum + volume.fillIndex,
          0
        )

        sums.set(library.id, currentSum + librarySum)
      })
    })

    return sums
  }, [data])

  if (!data.length) {
    return (
      <Typography color="text.secondary">
        {t('common.no_data', { defaultValue: 'Žádná data' })}
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              '& th': {
                backgroundColor: 'action.hover',
                fontWeight: 700,
              },
            }}
          >
            <TableCell>
              {t('plan_digitalization_modal.year', { defaultValue: 'Ročník' })}
            </TableCell>
            {libraryColumns.map((library) => (
              <TableCell key={library.id}>{library.shorthand}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((yearItem) => (
            <TableRow key={yearItem.year}>
              <TableCell sx={{ fontWeight: 600 }}>{yearItem.year}</TableCell>
              {libraryColumns.map((library) => {
                const yearLibrary = yearItem.libraries.find(
                  (l) => l.id === library.id
                )

                return (
                  <TableCell key={`${yearItem.year}-${library.id}`}>
                    {yearLibrary?.volumes?.length ? (
                      <Stack spacing={0.5}>
                        {yearLibrary.volumes.map((volume) => (
                          <Stack
                            key={volume.id}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="body2">
                              {volume.number}
                            </Typography>
                            <FillIndexIndicator value={volume.fillIndex} />
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
          <TableRow
            sx={(theme) => ({
              '& td': {
                backgroundColor: theme.palette.grey[50],
                borderTop: `2px solid ${theme.palette.divider}`,
                fontWeight: 700,
              },
            })}
          >
            <TableCell>
              {t('plan_digitalization_modal.fill_index_sum', {
                defaultValue: 'Součet indexů vyplnění',
              })}
            </TableCell>
            {libraryColumns.map((library) => (
              <TableCell key={`fill-index-sum-${library.id}`}>
                {fillIndexSums.get(library.id) ?? 0}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default LibrariesTable
