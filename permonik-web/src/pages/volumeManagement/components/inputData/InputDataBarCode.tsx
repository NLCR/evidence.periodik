import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useTranslation } from 'react-i18next'

const InputDataBarCode = () => {
  const setBarCode = useVolumeManagementStore(
    (state) => state.volumeActions.setBarCode
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
      <TableCell>{t('volume_overview.bar_code')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            fieldName: t('volume_overview.bar_code'),
            saveChange: (value: string) => {
              setBarCode(value)
              setSpecimensState(
                specimensState.map((specimen) => ({
                  ...specimen,
                  barCode: value,
                })),
                true
              )
            },
          }}
          name={'barCode'}
          fullWidth
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataBarCode
