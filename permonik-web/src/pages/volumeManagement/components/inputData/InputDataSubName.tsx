import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useTranslation } from 'react-i18next'

const InputDataSubName = () => {
  const subName = useVolumeManagementStore((state) => state.volumeState.subName)
  const setSubName = useVolumeManagementStore(
    (state) => state.volumeActions.setSubName
  )
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell>{t('volume_overview.sub_name')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            fieldName: t('volume_overview.sub_name'),
            saveChange: (value: string) => {
              console.log(
                `TODO: propsat zadanou zmenu ${value} do vsech exemplaru`
              )
            },
          }}
          value={subName}
          onChange={(event) => setSubName(event.target.value)}
          fullWidth
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataSubName
