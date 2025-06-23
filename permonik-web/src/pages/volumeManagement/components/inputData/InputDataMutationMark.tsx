import React, { useState } from 'react'
import InputDataTextField from './InputDataTextField'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useTranslation } from 'react-i18next'

const InputDataMutationMark = () => {
  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const volumeActions = useVolumeManagementStore((state) => state.volumeActions)
  const [isModalOpened, setIsModalOpened] = useState(false)
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
      <TableCell>
        <InputDataTextField
          editable
          writeChangesThrough={() => {
            console.log('TODO: propsat zadanou zmenu do vsech exemplaru')
          }}
          value={volumeState.mutationMark}
          onClick={() => setIsModalOpened(true)}
        />
        <MutationMarkSelectorModal
          row={volumeState}
          open={isModalOpened}
          onClose={() => setIsModalOpened(false)}
          onSave={(data) => volumeActions.setMutationMark(data.mutationMark)}
          //   TODO onSave se musi chovat ruzne pro propisovani a pro klasickou editaci inputData
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataMutationMark
