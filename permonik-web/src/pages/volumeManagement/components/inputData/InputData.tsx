import { useTranslation } from 'react-i18next'
import { FC, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { TMe } from '../../../../schema/user'
import { TMutation } from '../../../../schema/mutation'
import { TOwner } from '../../../../schema/owner'
import { TMetaTitle } from '../../../../schema/metaTitle'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'
import Periodicity from '../Periodicity'
import { TEdition } from '../../../../schema/edition'
import Typography from '@mui/material/Typography'
import { blue } from '@mui/material/colors'
import CollapsableSidebar from '../../../../components/CollapsableSidebar'
import InputDataSelect from './InputDataSelect'
import InputDataTextField from './InputDataTextField'
import InputDataDatePicker from './InputDataDatePicker'
import { InputDataEditabilityContextProvider } from './InputDataEditabilityContextProvider'

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

  const [isLocked, setIsLocked] = useState(true) //TODO get lock state from item existence

  return (
    <CollapsableSidebar>
      <InputDataEditabilityContextProvider
        disabled={!canEdit}
        locked={isLocked}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // boxShadow: theme.shadows[1],
            flexShrink: 0,
            height: '100%',
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
              height: '100%',
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
                    <InputDataSelect
                      value={volumeState.metaTitleId}
                      onChange={(event) =>
                        volumeActions.setMetaTitle(
                          event.target.value,
                          metaTitles.find((m) => m.id === event.target.value)
                            ?.name || ''
                        )
                      }
                      options={metaTitles.map((metaTitle) => ({
                        key: metaTitle.id,
                        value: metaTitle.name,
                      }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.sub_name')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.subName}
                      onChange={(event) =>
                        volumeActions.setSubName(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.mutation')}</TableCell>
                  <TableCell>
                    <InputDataSelect
                      value={volumeState.mutationId}
                      onChange={(event) =>
                        volumeActions.setMutationId(event.target.value)
                      }
                      options={mutations.map((mutation) => ({
                        key: mutation.id,
                        value: mutation.name[languageCode],
                      }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.mutationMark}
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
                    <InputDataTextField
                      value={volumeState.barCode}
                      onChange={(event) =>
                        volumeActions.setBarCode(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.signature')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.signature}
                      onChange={(event) =>
                        volumeActions.setSignature(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.year')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.year}
                      onChange={(event) =>
                        volumeActions.setYear(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.date_from')}</TableCell>
                  <TableCell>
                    <InputDataDatePicker
                      value={dayjs(volumeState.dateFrom)}
                      onChange={(value: Dayjs) =>
                        volumeActions.setDateFrom(value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.first_number')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.firstNumber}
                      onChange={(event) =>
                        volumeActions.setFirstNumber(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.date_to')}</TableCell>
                  <TableCell>
                    <InputDataDatePicker
                      value={dayjs(volumeState.dateTo)}
                      minDate={
                        dayjs(volumeState.dateFrom).isValid()
                          ? dayjs(volumeState.dateFrom)
                          : undefined
                      }
                      onChange={(value: Dayjs) =>
                        volumeActions.setDateTo(value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.last_number')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.lastNumber}
                      onChange={(event) =>
                        volumeActions.setLastNumber(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.owner')}</TableCell>
                  <TableCell>
                    <InputDataSelect
                      value={volumeState.ownerId}
                      onChange={(event) =>
                        volumeActions.setOwnerId(event.target.value)
                      }
                      options={owners
                        .filter(
                          (o) =>
                            me.role === 'super_admin' ||
                            me.owners?.includes(o.id)
                        )
                        .map((o) => ({ key: o.id, value: o.shorthand }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('volume_overview.note')}</TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={volumeState.note}
                      onChange={(event) =>
                        volumeActions.setNote(event.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Periodicity editions={editions} />
          </Box>
        </Box>
      </InputDataEditabilityContextProvider>
    </CollapsableSidebar>
  )
}

export default InputData
