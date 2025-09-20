import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useTranslation } from 'react-i18next'

const InputDataSignature = () => {
  const setSignature = useVolumeManagementStore(
    (state) => state.volumeActions.setSignature
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
      <TableCell>{t('volume_overview.signature')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            fieldName: t('volume_overview.signature'),
            saveChange: (value: string) => {
              setSignature(value)
              setSpecimensState(
                specimensState.map((specimen) => ({
                  ...specimen,
                  signature: value,
                })),
                true
              )
            },
          }}
          name={'signature'}
          fullWidth
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataSignature
