import { TEditableSpecimen } from '../../../../schema/specimen'
import clone from 'lodash/clone'
import { duplicatePartialSpecimen } from '../../../../utils/specimen'
import React, { FC } from 'react'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import theme from '../../../../theme'

type DuplicationCellProps = {
  row: TEditableSpecimen
  canEdit: boolean
}

const DuplicationEditCell: FC<DuplicationCellProps> = ({ row, canEdit }) => {
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )

  const duplicateRow = () => {
    const specimensState = useVolumeManagementStore.getState().specimensState
    const specimensStateClone = clone(specimensState)
    const copiedSpecimen = duplicatePartialSpecimen(row)
    const originalSpecimenIndex = specimensState.findIndex(
      (s) => s.id === row.id
    )

    if (originalSpecimenIndex >= 0) {
      specimensStateClone.splice(originalSpecimenIndex + 1, 0, copiedSpecimen)
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
        onClick={() => (canEdit ? duplicateRow() : null)}
        sx={{
          cursor: 'pointer',
          color: canEdit ? theme.palette.grey[900] : theme.palette.grey[600],
        }}
      />
    </Box>
  )
}

export default DuplicationEditCell
