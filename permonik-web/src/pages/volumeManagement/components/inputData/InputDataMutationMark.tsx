import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useTranslation } from 'react-i18next'

const InputDataMutationMark = () => {
  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const volumeActions = useVolumeManagementStore((state) => state.volumeActions)
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            fieldName: t('specimens_overview.mutation_mark'),
            saveChange: (value: string) => {
              console.log('TODO: propsat zmenu', value)
            },
          }}
          value={volumeState.mutationMark}
          isMutationMarkInputTextField
          onChange={(e) => volumeActions.setMutationMark(e.target.value)}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataMutationMark
