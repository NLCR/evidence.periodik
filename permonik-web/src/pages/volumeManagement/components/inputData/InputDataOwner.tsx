import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useTranslation } from 'react-i18next'
import InputDataSelect from './InputDataSelect'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useFormContext } from 'react-hook-form'
import { mapTintToColor } from './utils/tint'
import { TOwner } from '../../../../schema/owner'
import { TMe } from '../../../../schema/user'

type Props = { owners: TOwner[]; me: TMe }

const InputDataOwner = ({ owners, me }: Props) => {
  const setOwnerId = useVolumeManagementStore(
    (state) => state.volumeActions.setOwnerId
  )
  const { t } = useTranslation()

  const specimensState = useVolumeManagementStore(
    (state) => state.specimensState
  )
  const setSpecimensState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )

  const { watch } = useFormContext()
  const isDuplicated = location.href.includes('duplicated')
  const isEmpty = !watch('ownerId')

  return (
    <TableRow
      sx={{
        backgroundColor: mapTintToColor(
          isDuplicated && isEmpty ? 'error' : 'default'
        ),
      }}
    >
      <TableCell>{t('volume_overview.owner')}</TableCell>
      <TableCell>
        <InputDataSelect
          editableData={{
            saveChange: (value: string) => {
              setOwnerId(value)
              setSpecimensState(
                specimensState.map((specimen) => ({
                  ...specimen,
                  ownerId: value,
                })),
                true
              )
            },
            fieldName: t('volume_overview.owner'),
          }}
          name="ownerId"
          options={owners
            .filter(
              (o) => me.role === 'super_admin' || me.owners?.includes(o.id)
            )
            .map((o) => ({ key: o.id, value: o.shorthand }))}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataOwner
