import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { useTranslation } from 'react-i18next'
import InputDataSelect from './InputDataSelect'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { TMutation } from '../../../../schema/mutation'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'
import { useFormContext } from 'react-hook-form'
import { mapTintToColor } from './utils/tint'

type Props = { mutations: TMutation[] }

const InputDataMutation = ({ mutations }: Props) => {
  const setMutationId = useVolumeManagementStore(
    (state) => state.volumeActions.setMutationId
  )
  const { t } = useTranslation()
  const { languageCode } = useLanguageCode()

  const specimensState = useVolumeManagementStore(
    (state) => state.specimensState
  )
  const setSpecimensState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )

  const { watch } = useFormContext()
  const isDuplicated = location.href.includes('duplicated')
  const isEmpty = !watch('mutationId')

  return (
    <TableRow
      sx={{
        backgroundColor: mapTintToColor(
          isDuplicated && isEmpty ? 'error' : 'default'
        ),
      }}
    >
      <TableCell>{t('volume_overview.mutation')}</TableCell>
      <TableCell>
        <InputDataSelect
          editableData={{
            saveChange: (value: string) => {
              setMutationId(value)
              setSpecimensState(
                specimensState.map((specimen) => ({
                  ...specimen,
                  mutationId: value,
                })),
                true
              )
            },
            fieldName: t('volume_overview.mutation'),
          }}
          name={'mutationId'}
          options={mutations.map((mutation) => ({
            key: mutation.id,
            value: mutation.name[languageCode],
          }))}
        />
      </TableCell>
    </TableRow>
  )
}

export default InputDataMutation
