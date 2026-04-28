import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useTranslation } from 'react-i18next'
import InputDataSelect from './InputDataSelect'
undefined
import { useFormContext } from 'react-hook-form'
import { mapTintToColor } from './utils/tint'
undefined
undefined

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
      <TableCell>{t('common.fields.owner')}</TableCell>
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
            fieldName: t('common.fields.owner'),
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
