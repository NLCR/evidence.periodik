/* eslint-disable no-nested-ternary */
import React, { FC, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import clone from 'lodash/clone'
import isEqual from 'lodash/isEqual'
import dayjs from 'dayjs'
import { useVolumeManagementStore } from '../../../slices/useVolumeManagementStore'
import { TEdition } from '../../../schema/edition'
import {
  TEditableVolumePeriodicity,
  VolumeSchema,
} from '../../../schema/volume'
import { TEditableSpecimen } from '../../../schema/specimen'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FormControlLabel from '@mui/material/FormControlLabel'
import useSortedSpecimensNamesAndSubNames from '../../../hooks/useSortedSpecimensNamesAndSubNames'
import Autocomplete from '@mui/material/Autocomplete'
import ModalContainer from '../../../components/ModalContainer'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { repairOrCreateSpecimen } from '../../../utils/specimen'
import { repairVolume } from '../../../utils/volume'
import InputDataCheckbox from './inputData/InputDataCheckbox'
import InputDataSelect from './inputData/InputDataSelect'
import InputDataTextField from './inputData/InputDataTextField'
import IconButton from '@mui/material/IconButton'
import { useInputDataEditabilityContext } from './inputData/InputDataEditabilityContextProvider'

const getDaysArray = (start: string, end: string): string[] => {
  const arr: string[] = []
  let current = dayjs(start)
  const endDay = dayjs(end)

  while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
    arr.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  return arr
}

const getDayName = (date: string): string => {
  return dayjs(date).format('dddd')
}

interface PeriodicityProps {
  editions: TEdition[]
}

const Periodicity: FC<PeriodicityProps> = ({ editions }) => {
  const [periodicityModalVisible, setPeriodicityModalVisible] = useState(false)
  const { t, i18n } = useTranslation()
  const { languageCode } = useLanguageCode()

  const { disabled, locked } = useInputDataEditabilityContext()

  const setShowAttachmentsAtTheEnd = useVolumeManagementStore(
    (state) => state.volumeActions.setShowAttachmentsAtTheEnd
  )
  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const volumeState = useVolumeManagementStore((state) => state.volumeState)

  const { names, subNames } = useSortedSpecimensNamesAndSubNames()

  const duplicateRow = (row: TEditableVolumePeriodicity) => {
    const periodicityClone = clone(volumeState.periodicity)
    const periodicityIndex = volumeState.periodicity.findIndex((p) =>
      isEqual(p, row)
    )

    if (periodicityIndex >= 0) {
      periodicityClone.splice(periodicityIndex + 1, 0, {
        ...row,
        duplicated: true,
      })
      volumePeriodicityActions.setPeriodicityState(periodicityClone)
    }
  }

  const removeRow = (row: TEditableVolumePeriodicity) => {
    const periodicityClone = clone(volumeState.periodicity)
    const periodicityIndex = volumeState.periodicity.findIndex((p) =>
      isEqual(p, row)
    )

    if (periodicityIndex >= 0) {
      periodicityClone.splice(periodicityIndex, 1)
      volumePeriodicityActions.setPeriodicityState(periodicityClone)
    }
  }

  const generateVolume = () => {
    // This ensures that `getDayName` will return english name of day
    dayjs.locale('en')
    const volumeClone = clone(volumeState)

    const repairedVolume = repairVolume(volumeClone, editions)
    const validation = VolumeSchema.safeParse(repairedVolume)

    if (!validation.success) {
      validation.error.errors.map((e) => toast.error(e.message))
      // toast.error(t('volume_overview.volume_input_data_validation_error'))
      return
    }

    const dates = getDaysArray(repairedVolume.dateFrom, repairedVolume.dateTo)

    const specimens: TEditableSpecimen[] = []

    let number = repairedVolume.firstNumber
    let attachmentNumber = 1
    let periodicAttachmentNumber = 1
    const defaultEdition = editions.find((edition) => edition.isDefault)

    dates.forEach((dt) => {
      const dayStr = getDayName(dt)
      let inserted = false
      repairedVolume.periodicity.forEach((p) => {
        if (p.numExists && p.day === dayStr) {
          const isAttachment = !!editions.find((pub) => pub.id === p.editionId)
            ?.isAttachment
          const isPeriodicAttachment = !!editions.find(
            (pub) => pub.id === p.editionId
          )?.isPeriodicAttachment

          const specimen = repairOrCreateSpecimen(
            {
              publicationDate: dt,
              publicationDateString: dayjs(dt).format('YYYYMMDD'),
              mutationMark: repairedVolume.mutationMark,
              mutationId: repairedVolume.mutationId,
              numExists: true,
              pagesCount: p.pagesCount,
              name: p.name,
              subName: p.subName,
              editionId: p.editionId,
              isAttachment,
              number: !isAttachment ? number.toString() : '',
              attachmentNumber: isAttachment
                ? isPeriodicAttachment
                  ? periodicAttachmentNumber.toString()
                  : attachmentNumber.toString()
                : '',
            },
            repairedVolume
          )

          if (isPeriodicAttachment) {
            periodicAttachmentNumber += 1
          } else if (isAttachment) {
            attachmentNumber += 1
          } else {
            number += 1
          }

          inserted = true

          specimens.push(specimen)
        }
      })

      if (!inserted) {
        const specimen = repairOrCreateSpecimen(
          {
            publicationDate: dt,
            publicationDateString: dayjs(dt).format('YYYYMMDD'),
            mutationMark: repairedVolume.mutationMark,
            mutationId: repairedVolume.mutationId,
            numExists: false,
            editionId: defaultEdition?.id,
          },
          repairedVolume
        )

        specimens.push(specimen)
      }
    })

    dayjs.locale(i18n.resolvedLanguage)
    specimensActions.setSpecimensState(specimens, true)
    volumePeriodicityActions.setPeriodicityGenerationUsed(true)
    toast.success(t('volume_overview.specimens_generated_successfully'))
    setPeriodicityModalVisible(false)
  }

  return (
    <>
      <Button
        // disabled={!canEdit}
        variant="contained"
        onClick={() => setPeriodicityModalVisible(true)}
      >
        {t('volume_overview.edit_periodicity')}
      </Button>
      <ModalContainer
        header={t('volume_overview.periodicity')}
        opened={periodicityModalVisible}
        onClose={() => setPeriodicityModalVisible(false)}
        closeButton={{
          callback: () => setPeriodicityModalVisible(false),
        }}
        acceptButton={{
          callback: () => generateVolume(),
          text: t('volume_overview.generate_volume'),
          disabled: disabled || locked,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('volume_overview.releasing')}</TableCell>
              <TableCell>{t('volume_overview.is_in_volume')}</TableCell>
              <TableCell>{t('volume_overview.edition')}</TableCell>
              <TableCell>{t('volume_overview.pages_count')}</TableCell>
              <TableCell>{t('volume_overview.name')}</TableCell>
              <TableCell>{t('volume_overview.sub_name')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volumeState.periodicity.map((p, index) => {
              return (
                <TableRow key={`volume-periodicity-${p.day}`}>
                  <TableCell>{t(`volume_overview.days.${p.day}`)}</TableCell>
                  <TableCell>
                    <InputDataCheckbox
                      checked={p.numExists}
                      onChange={(event) =>
                        volumePeriodicityActions.setNumExists(
                          event.target.checked,
                          index
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <InputDataSelect
                      value={p.editionId ?? undefined}
                      onChange={(event) =>
                        volumePeriodicityActions.setEditionId(
                          event.target.value,
                          index
                        )
                      }
                      options={editions.map((o) => ({
                        key: o.id,
                        value: o.name[languageCode],
                      }))}
                    />
                  </TableCell>
                  <TableCell>
                    <InputDataTextField
                      value={p.pagesCount}
                      onChange={(event) =>
                        volumePeriodicityActions.setPagesCount(
                          event.target.value,
                          index
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          onBlur={(event) =>
                            volumePeriodicityActions.setName(
                              event.target.value,
                              index
                            )
                          }
                        />
                      )}
                      sx={{
                        minWidth: '200px',
                      }}
                      size="small"
                      value={p.name}
                      disabled={disabled || locked}
                      onChange={(event, value) =>
                        volumePeriodicityActions.setName(
                          value ? value : '',
                          index
                        )
                      }
                      options={names}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label=""
                          onBlur={(event) =>
                            volumePeriodicityActions.setSubName(
                              event.target.value,
                              index
                            )
                          }
                        />
                      )}
                      sx={{
                        minWidth: '200px',
                      }}
                      size="small"
                      value={p.subName}
                      disabled={disabled || locked}
                      onChange={(event, value) =>
                        volumePeriodicityActions.setSubName(
                          value ? value : '',
                          index
                        )
                      }
                      options={subNames}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      {p.duplicated ? (
                        <IconButton disabled={disabled || locked}>
                          <DeleteOutlineIcon
                            onClick={() => removeRow(p)}
                            sx={{
                              cursor: 'pointer',
                            }}
                          />
                        </IconButton>
                      ) : (
                        <IconButton disabled={disabled || locked}>
                          <AddCircleOutlineIcon
                            onClick={() => duplicateRow(p)}
                            sx={{
                              cursor: 'pointer',
                            }}
                          />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <FormControlLabel
          sx={{
            // display: 'flex',
            marginTop: '10px',
            // justifyContent: 'space-between',
            // alignItems: 'start',
            // fontSize: '12px',
          }}
          control={
            <Checkbox
              checked={volumeState.showAttachmentsAtTheEnd}
              onChange={(event) =>
                setShowAttachmentsAtTheEnd(event.target.checked)
              }
              disabled={disabled || locked}
              sx={{
                // marginTop: 1,
                // marginBottom: 1,
                cursor: 'pointer',
                // width: '100%',
              }}
            />
          }
          label={t('volume_overview.show_attachments_at_the_end')}
        />
      </ModalContainer>
    </>
  )
}

export default Periodicity
