import { GridRenderEditCellParams } from '@mui/x-data-grid/models/params/gridCellParams'
import React, { useState } from 'react'
import { TEditableSpecimen } from '../../../../schema/specimen'
import MutationMarkSelectorModal from './MutationMarkSelectorModal'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

const MutationMarkSelectorModalContainer = (
  props: GridRenderEditCellParams<TEditableSpecimen>
) => {
  const { row, api } = props
  const [modalOpened, setModalOpened] = useState(false)

  const handleSave = (updatedRow: TEditableSpecimen) => {
    api.updateRows([updatedRow])
  }

  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
        }}
      >
        {row.mutationMark.mark}
        <IconButton color="primary" onClick={() => setModalOpened(true)}>
          <EditIcon />
        </IconButton>
      </Box>
      <MutationMarkSelectorModal
        row={row}
        open={modalOpened}
        onClose={() => setModalOpened(false)}
        onSave={(data) => handleSave(data as TEditableSpecimen)}
      />
    </>
  )
}

export default MutationMarkSelectorModalContainer
