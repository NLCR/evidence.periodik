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

  if (!data.length) {
    return (
      <Typography color="text.secondary">
        {t('common.no_data', { defaultValue: 'Žádná data' })}
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
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
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default LibrariesTable
