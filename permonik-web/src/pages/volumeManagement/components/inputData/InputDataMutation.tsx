import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import React from 'react'
import { useTranslation } from 'react-i18next'
import InputDataSelect from './InputDataSelect'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { TMutation } from '../../../../schema/mutation'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'

type Props = { mutations: TMutation[] }

const InputDataMutation = ({ mutations }: Props) => {
  const mutationId = useVolumeManagementStore(
    (state) => state.volumeState.mutationId
  )
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

  return (
    <TableRow>
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
          value={mutationId}
          onChange={(event) => setMutationId(event.target.value)}
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
