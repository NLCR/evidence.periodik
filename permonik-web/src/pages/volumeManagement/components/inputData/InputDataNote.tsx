import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useTranslation } from 'react-i18next'

const InputDataNote = () => {
  const setNote = useVolumeManagementStore(
    (state) => state.volumeActions.setNote
  )
  const { t } = useTranslation()
  return (
    <TableRow>
      <TableCell>{t('volume_overview.note')}</TableCell>
      <TableCell>
        <InputDataTextField
          editableData={{
            changeShouldNotAffectSpecimen: true,
            fieldName: t('volume_overview.note'),
            saveChange: (value: string) => {
              setNote(value)
            },
          }}
          name={'note'}
          fullWidth
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataNote
