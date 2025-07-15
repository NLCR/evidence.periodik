import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useTranslation } from 'react-i18next'

const InputDataSubName = () => {
  const setSubName = useVolumeManagementStore(
    (state) => state.volumeActions.setSubName
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
      <TableCell>{t('volume_overview.sub_name')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            fieldName: t('volume_overview.sub_name'),
            saveChange: (value: string) => {
              setSubName(value)
              setSpecimensState(
                specimensState.map((specimen) => ({
                  ...specimen,
                  subName: value,
                })),
                true
              )
            },
          }}
          name={'subName'}
          fullWidth
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataSubName
