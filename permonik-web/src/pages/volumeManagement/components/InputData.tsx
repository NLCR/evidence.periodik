import { useTranslation } from 'react-i18next'
import React, { FC, useState } from 'react'
import dayjs from 'dayjs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers-pro'
import { useVolumeManagementStore } from '../../../slices/useVolumeManagementStore'
import { TMe } from '../../../schema/user'
import { TMutation } from '../../../schema/mutation'
import { TOwner } from '../../../schema/owner'
import { TMetaTitle } from '../../../schema/metaTitle'
import MutationMarkSelectorModal from './editCells/MutationMarkSelectorModal'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import Periodicity from './Periodicity'
import { TEdition } from '../../../schema/edition'
import Typography from '@mui/material/Typography'
import { blue } from '@mui/material/colors'
import CollapsableSidebar from '../../../components/CollapsableSidebar'

interface InputDataProps {
  canEdit: boolean
  me: TMe
  mutations: TMutation[]
  owners: TOwner[]
  metaTitles: TMetaTitle[]
  editions: TEdition[]
}

const InputData: FC<InputDataProps> = ({
  canEdit,
  me,
  mutations,
  owners,
  metaTitles,
  editions,
}) => {
  const { t } = useTranslation()
  const { languageCode } = useLanguageCode()

  const [mutationMarksModalOpened, setMutationMarksModalOpened] =
    useState(false)

  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const volumeActions = useVolumeManagementStore((state) => state.volumeActions)

  return (
    <CollapsableSidebar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // boxShadow: theme.shadows[1],
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            marginBottom: '8px',
            color: blue['900'],
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          {t('volume_overview.volume_information')}
        </Typography>

        <Box
          sx={{
            overflowY: 'auto',
          }}
        >
          <Table
            size="small"
            sx={{
              marginBottom: '16px',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t('volume_overview.name')}</TableCell>
                <TableCell>{t('volume_overview.value')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{t('volume_overview.meta_title')}</TableCell>
                <TableCell>
                  <Select
                    variant="outlined"
                    size="small"
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    value={volumeState.metaTitleId}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setMetaTitle(
                        event.target.value,
                        metaTitles.find((m) => m.id === event.target.value)
                          ?.name || ''
                      )
                    }
                  >
                    {metaTitles.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.sub_name')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.subName}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setSubName(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.mutation')}</TableCell>
                <TableCell>
                  <Select
                    variant="outlined"
                    size="small"
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    value={volumeState.mutationId}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setMutationId(event.target.value)
                    }
                  >
                    {mutations.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.name[languageCode]}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    disabled={!canEdit}
                    value={volumeState.mutationMark}
                    size="small"
                    onClick={() => setMutationMarksModalOpened(true)}
                  />
                  <MutationMarkSelectorModal
                    row={volumeState}
                    open={mutationMarksModalOpened}
                    onClose={() => setMutationMarksModalOpened(false)}
                    onSave={(data) =>
                      volumeActions.setMutationMark(data.mutationMark)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.bar_code')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.barCode}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setBarCode(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.signature')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.signature}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setSignature(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.year')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.year}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setYear(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.date_from')}</TableCell>
                <TableCell>
                  <DatePicker
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    disabled={!canEdit}
                    value={dayjs(volumeState.dateFrom)}
                    onChange={(value) => volumeActions.setDateFrom(value)}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.first_number')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.firstNumber}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setFirstNumber(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.date_to')}</TableCell>
                <TableCell>
                  <DatePicker
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    disabled={!canEdit}
                    value={dayjs(volumeState.dateTo)}
                    minDate={
                      dayjs(volumeState.dateFrom).isValid()
                        ? dayjs(volumeState.dateFrom)
                        : undefined
                    }
                    onChange={(value) => volumeActions.setDateTo(value)}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.last_number')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.lastNumber}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setLastNumber(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.owner')}</TableCell>
                <TableCell>
                  <Select
                    variant="outlined"
                    size="small"
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    value={volumeState.ownerId}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setOwnerId(event.target.value)
                    }
                  >
                    {me.role === 'super_admin'
                      ? owners.map((o) => (
                          <MenuItem key={o.id} value={o.id}>
                            {o.shorthand}
                          </MenuItem>
                        ))
                      : owners
                          .filter((o) => me.owners?.includes(o.id))
                          .map((o) => (
                            <MenuItem key={o.id} value={o.id}>
                              {o.shorthand}
                            </MenuItem>
                          ))}
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{t('volume_overview.note')}</TableCell>
                <TableCell>
                  <TextField
                    sx={{
                      maxWidth: '200px',
                      width: '100%',
                    }}
                    size="small"
                    value={volumeState.note}
                    disabled={!canEdit}
                    onChange={(event) =>
                      volumeActions.setNote(event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Periodicity canEdit={canEdit} editions={editions} />
        </Box>
      </Box>
    </CollapsableSidebar>
  )
}

export default InputData
