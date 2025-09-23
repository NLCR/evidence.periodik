import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import InputDataTextField from './InputDataTextField'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { TEditableVolume } from '../../../../schema/volume'

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

  const { getValues, setValue } = useFormContext<TEditableVolume>()

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
          onChangeCallback={(value: string) => {
            // update the subnames of all periodicity days
            const periodicity = getValues('periodicity')
            periodicity.forEach((day, index) => {
              if (day.numExists) {
                setValue(`periodicity.${index}.subName`, value)
              }
            })
          }}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataSubName
