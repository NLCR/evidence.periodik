/* eslint-disable no-nested-ternary */
import { FC, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import cloneDeep from 'lodash/cloneDeep'
import dayjs from 'dayjs'
import { useVolumeManagementStore } from '../../../slices/useVolumeManagementStore'
import { TEdition } from '../../../schema/edition'
import {
  TEditableVolume,
  TVolumePeriodicityDays,
  VolumeSchema,
} from '../../../schema/volume'
import { TEditableSpecimen } from '../../../schema/specimen'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import useSortedSpecimensNamesAndSubNames from '../../../hooks/useSortedSpecimensNamesAndSubNames'
import ModalContainer from '../../../components/ModalContainer'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { repairOrCreateSpecimen } from '../../../utils/specimen'
import { repairVolume } from '../../../utils/volume'
import InputDataCheckbox from './inputData/InputDataCheckbox'
import InputDataSelect from './inputData/InputDataSelect'
import InputDataTextField from './inputData/InputDataTextField'
import IconButton from '@mui/material/IconButton'
import { useInputDataEditabilityContext } from './inputData/InputDataEditabilityContextProvider'
import { useFieldArray, useFormContext } from 'react-hook-form'
import InputDataAutocomplete from './inputData/InputDataAutocomplete'

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

  const { disabled, locked, setLocked } = useInputDataEditabilityContext()
  const { getValues, watch, control, reset } = useFormContext()

  const { fields, remove, insert } = useFieldArray({
    control,
    name: 'periodicity',
  })

  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const setVolumeState = useVolumeManagementStore(
    (state) => state.volumeActions.setVolumeState
  )
  const setHasUnsavedData = useVolumeManagementStore(
    (state) => state.setStateHasUnsavedData
  )

  const { names, subNames } = useSortedSpecimensNamesAndSubNames()

  const generateVolume: () => boolean = () => {
    // This ensures that `getDayName` will return english name of day
    dayjs.locale('en')
    const volumeData = getValues() as TEditableVolume
    const volumeClone = cloneDeep(volumeData)
    const repairedVolume = repairVolume(volumeClone, editions)
    const validation = VolumeSchema.safeParse(repairedVolume)

    if (!validation.success) {
      validation.error.errors.map((e) => toast.error(e.message))
      // toast.error(t('volume_overview.volume_input_data_validation_error'))
      return false
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
    setVolumeState(volumeClone, false)
    setHasUnsavedData(true)
    reset(volumeClone) // reset isDirty flag
    setPeriodicityModalVisible(false)
    return true
  }

  return (
    <>
      <Button
        // disabled={!canEdit}
        variant="contained"
        fullWidth
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
          callback: () => {
            if (generateVolume()) {
              setLocked(true)
            }
          },
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
            {fields.map((p, index) => {
              const disabledRow = !watch(`periodicity.${index}.numExists`)
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    {t(
                      `volume_overview.days.${getValues(`periodicity.${index}.day`) as TVolumePeriodicityDays}`
                    )}
                  </TableCell>
                  <TableCell>
                    <InputDataCheckbox
                      name={`periodicity.${index}.numExists`}
                    />
                  </TableCell>
                  <TableCell>
                    <InputDataSelect
                      name={`periodicity.${index}.editionId`}
                      disabled={disabledRow}
                      options={editions.map((o) => ({
                        key: o.id,
                        value: o.name[languageCode],
                      }))}
                    />
                  </TableCell>
                  <TableCell>
                    <InputDataTextField
                      name={`periodicity.${index}.pagesCount`}
                      disabled={disabledRow}
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <InputDataAutocomplete
                      name={`periodicity.${index}.name`}
                      disabled={disabledRow}
                      options={names}
                    />
                  </TableCell>
                  <TableCell>
                    <InputDataAutocomplete
                      name={`periodicity.${index}.subName`}
                      disabled={disabledRow}
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
                      {getValues(`periodicity.${index}.duplicated`) ? (
                        <IconButton
                          disabled={disabled || locked || disabledRow}
                        >
                          <DeleteOutlineIcon
                            onClick={() => remove(index)}
                            sx={{
                              cursor: 'pointer',
                            }}
                          />
                        </IconButton>
                      ) : (
                        <IconButton
                          disabled={disabled || locked || disabledRow}
                        >
                          <AddCircleOutlineIcon
                            onClick={() =>
                              insert(index + 1, { ...p, duplicated: true }, {})
                            }
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
        <Box
          sx={{
            marginTop: '10px',
          }}
        >
          <InputDataCheckbox
            name={`showAttachmentsAtTheEnd`}
            label={t('volume_overview.show_attachments_at_the_end')}
          />
        </Box>
      </ModalContainer>
    </>
  )
}

export default Periodicity
