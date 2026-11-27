import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { type FC, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import VolumeCard from './VolumeCard'
import { type PlanDigitalizationResponse } from './schemas'

type Props = {
  data: PlanDigitalizationResponse
}

type FillIndexSum = {
  coverage: number
  quality: number
  volumeIds: Set<string>
}

const LibrariesTable: FC<Props> = ({ data }) => {
  const { t } = useTranslation()
  const legendId = useId()
  const [selectedVolumes, setSelectedVolumes] = useState(
    () => new Map<string, number>()
  )
  const selectedVolumesPageCount = [...selectedVolumes.values()].reduce(
    (sum, pages) => sum + pages,
    0
  )

  const changeSelection = (id: string, pages: number, checked: boolean) => {
    setSelectedVolumes((previous) => {
      const next = new Map(previous)
      if (checked) next.set(id, pages)
      else next.delete(id)
      return next
    })
  }

  const libraryColumns = useMemo(() => {
    const map = new Map<string, { id: string; shorthand: string }>()

    data.forEach((yearItem) => {
      yearItem.libraries.forEach((library) => {
        if (!map.has(library.id)) {
          map.set(library.id, { id: library.id, shorthand: library.shorthand })
        }
      })
    })

    return Array.from(map.values()).sort(
      (a, b) =>
        a.shorthand.localeCompare(b.shorthand, 'cs') ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    )
  }, [data])

  const fillIndexSums = useMemo(() => {
    const sums = new Map<string, FillIndexSum>()

    data.forEach((yearItem) => {
      yearItem.libraries.forEach((library) => {
        const sum = sums.get(library.id) ?? {
          coverage: 0,
          quality: 0,
          volumeIds: new Set<string>(),
        }
        library.volumes.forEach((volume) => {
          if (sum.volumeIds.has(volume.id)) return

          sum.volumeIds.add(volume.id)
          sum.coverage += Math.floor(volume.fillIndex / 1000)
          sum.quality += volume.fillIndex % 1000
        })
        sums.set(library.id, sum)
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
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <TableContainer component={Paper} variant="outlined">
        <Table
          aria-describedby={legendId}
          size="small"
          sx={{
            '& tr > :first-child': { px: 1 },
            '& tr > :not(:last-child)': {
              borderRight: 1,
              borderRightColor: 'divider',
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  backgroundColor: 'action.hover',
                  fontWeight: 700,
                },
              }}
            >
              <TableCell
                sx={{ boxSizing: 'content-box', width: '9ch', minWidth: '9ch' }}
              >
                {t('plan_digitalization_modal.year', { defaultValue: 'Rok' })}
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
                            <VolumeCard
                              key={volume.id}
                              volume={volume}
                              selected={selectedVolumes.has(volume.id)}
                              onSelectionChange={(checked) =>
                                changeSelection(
                                  volume.id,
                                  volume.pagesCount,
                                  checked
                                )
                              }
                            />
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
              <TableCell sx={{ overflowWrap: 'anywhere' }}>
                {t('plan_digitalization_modal.fill_index_sum', {
                  defaultValue: 'Souhrnný index vyplnění',
                })}
              </TableCell>
              {libraryColumns.map((library) => (
                <TableCell key={`fill-index-sum-${library.id}`}>
                  {(() => {
                    const sum = fillIndexSums.get(library.id)
                    if (!sum || sum.volumeIds.size === 0) return '0–000'

                    return `${sum.coverage}–${String(
                      Math.round(sum.quality / sum.volumeIds.size)
                    ).padStart(3, '0')}`
                  })()}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={1} alignItems="center">
        <DescriptionOutlinedIcon fontSize="small" />
        <Typography role="status" variant="body2" sx={{ paddingTop: 0.5 }}>
          {t('plan_digitalization_modal.selected_pages', {
            pages: selectedVolumesPageCount,
          })}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          disabled={selectedVolumes.size === 0}
          onClick={() => setSelectedVolumes(new Map())}
        >
          {t('plan_digitalization_modal.clear_selection')}
        </Button>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        color="text.secondary"
      >
        <InfoOutlinedIcon fontSize="small" />
        <Typography variant="body2" sx={{ paddingTop: 0.5 }}>
          {t('plan_digitalization_modal.selection_help')}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        color="text.secondary"
      >
        <InfoOutlinedIcon fontSize="small" />
        <Typography id={legendId} variant="body2" sx={{ paddingTop: 0.5 }}>
          {t('plan_digitalization_modal.continuation_legend')}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default LibrariesTable
