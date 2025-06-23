import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useTranslation } from 'react-i18next'

const InputDataMutationMark = () => {
  const mutationMark = useVolumeManagementStore(
    (state) => state.volumeState.mutationMark
  )
  const setMutationMark = useVolumeManagementStore(
    (state) => state.volumeActions.setMutationMark
  )
  const { t } = useTranslation()

  const specimensState = useVolumeManagementStore(
    (state) => state.specimensState
  )
  const setSpecimensState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )

  return (
    <TableRow>
      <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            fieldName: t('specimens_overview.mutation_mark'),
            saveChange: (value: string) => {
              setMutationMark(value)
              setSpecimensState(
                specimensState.map((specimen) => ({
                  ...specimen,
                  mutationMark: value,
                })),
                true
              )
            },
          }}
          value={mutationMark}
          isMutationMarkInputTextField
          onChange={(e) => setMutationMark(e.target.value)}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataMutationMark
