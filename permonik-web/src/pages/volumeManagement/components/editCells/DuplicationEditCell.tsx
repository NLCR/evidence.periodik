import { TEditableSpecimen } from '../../../../schema/specimen'
import clone from 'lodash/clone'
import { duplicatePartialSpecimen } from '../../../../utils/specimen'
import React, { FC, useState } from 'react'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import theme from '../../../../theme'
import ModalContainer from '../../../../components/ModalContainer'
import { useTranslation } from 'react-i18next'
import dayjs, { Dayjs } from 'dayjs'
import DuplicationEditCellDateModal from './DuplicationEditCellDateModal'

type DuplicationCellProps = {
  row: TEditableSpecimen
  canEdit: boolean
}

const DuplicationEditCell: FC<DuplicationCellProps> = ({ row, canEdit }) => {
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
  const [date, setDate] = useState<Dayjs>(dayjs(row.publicationDate))
  const { t } = useTranslation()

  const duplicateRow = (date: Dayjs) => {
    const specimensState = useVolumeManagementStore.getState().specimensState
    const specimensStateClone = clone(specimensState)
    const duplicatedSpecimen = duplicatePartialSpecimen(row)
    // adjust the date of the duplicated entry
    duplicatedSpecimen.publicationDate = date.toISOString()
    duplicatedSpecimen.publicationDateString = date.format('YYYYMMDD')
    // find the index before the place where the new entry should be put
    const desiredSpecimenIndex = specimensState.findLastIndex(
      (s) => dayjs(s.publicationDate) <= date
    )

    // update state
    if (desiredSpecimenIndex >= 0) {
      specimensStateClone.splice(
        desiredSpecimenIndex + 1,
        0,
        duplicatedSpecimen
      )
      specimensActions.setSpecimensState(specimensStateClone, true)
    }
  }

  const removeRow = () => {
    const specimensState = useVolumeManagementStore.getState().specimensState
    const specimensStateClone = clone(specimensState)
    const specimenIndex = specimensState.findIndex((s) => s.id === row.id)

    if (specimenIndex >= 0) {
      specimensStateClone.splice(specimenIndex, 1)
      specimensActions.setSpecimensState(specimensStateClone, true)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        gap: '4px',
      }}
    >
      {row.duplicated ? (
        <DeleteOutlineIcon
          onClick={() => (canEdit ? removeRow() : null)}
          sx={{
            cursor: 'pointer',
            color: canEdit ? theme.palette.grey[900] : theme.palette.grey[600],
          }}
        />
      ) : null}
      <AddCircleOutlineIcon
        onClick={() => (canEdit ? setIsDuplicateModalOpen(true) : null)}
        sx={{
          cursor: 'pointer',
          color: canEdit ? theme.palette.grey[900] : theme.palette.grey[600],
        }}
      />
      {/* Modal with date selection for the duplicated entry */}
      <ModalContainer
        onClose={() => {
          setIsDuplicateModalOpen(false)
          // reset date picker
          setDate(dayjs(row.publicationDate))
        }}
        closeButton={{ callback: () => setIsDuplicateModalOpen(false) }}
        opened={isDuplicateModalOpen}
        header={t('specimens_overview.duplicate_dialog_title')}
        style="fitted"
        acceptButton={{
          callback: () => {
            duplicateRow(date)
            setIsDuplicateModalOpen(false)
            // reset date picker
            setDate(dayjs(row.publicationDate))
          },
        }}
      >
        <DuplicationEditCellDateModal date={date} setDate={setDate} />
      </ModalContainer>
    </Box>
  )
}

export default DuplicationEditCell
