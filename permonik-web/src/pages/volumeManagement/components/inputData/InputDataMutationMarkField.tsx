import LockedInputDataItem from './LockedInputDataItem'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useState } from 'react'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type FieldProps = {
  disabled?: boolean
}

const Field = ({ disabled = false, ...props }: FieldProps & TextFieldProps) => {
  const [isModalOpened, setIsModalOpened] = useState(false)
  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const { setValue, watch } = useFormContext()

  const mutationMark = watch('mutationMark_internal')
  const mutationMarkNumber = watch('mutationMarkNumber_internal')
  const mutationMarkNumberDescription = watch(
    'mutationMarkNumberDescription_internal'
  )

  const value =
    mutationMark ||
    (mutationMarkNumber
      ? `${mutationMarkNumber} (${mutationMarkNumberDescription})`
      : undefined)

  return (
    <>
      <TextField
        variant="outlined"
        size="small"
        sx={{
          width: '100%',
        }}
        disabled={disabled}
        {...props}
        value={value === undefined ? props.defaultValue : value}
        defaultValue={undefined}
        onClick={() => setIsModalOpened(true)}
      />

      <MutationMarkSelectorModal
        row={volumeState}
        open={isModalOpened}
        onClose={() => setIsModalOpened(false)}
        onSave={(data) => {
          setValue('mutationMark_internal', data.mutationMark, {
            shouldDirty: true,
          })
          setValue('mutationMarkNumber_internal', data.mutationMarkNumber, {
            shouldDirty: true,
          })
          setValue(
            'mutationMarkNumberDescription_internal',
            data.mutationMarkNumberDescription,
            {
              shouldDirty: true,
            }
          )
        }}
      />
    </>
  )
}

const InputDataMutationMarkField = (props: TextFieldProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { getValues, watch, setValue } = useFormContext()

  const setMutationMark = useVolumeManagementStore(
    (state) => state.volumeActions.setMutationMark
  )
  const setMutationMarkNumber = useVolumeManagementStore(
    (state) => state.volumeActions.setMutationMarkNumber
  )
  const setMutationMarkNumberDescription = useVolumeManagementStore(
    (state) => state.volumeActions.setMutationMarkNumberDescription
  )
  const { t } = useTranslation()

  const specimensState = useVolumeManagementStore(
    (state) => state.specimensState
  )
  const setSpecimensState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )

  const mutationMark = watch('mutationMark')
  const mutationMarkNumber = watch('mutationMarkNumber')
  const mutationMarkNumberDescription = watch('mutationMarkNumberDescription')

  const value =
    mutationMark ||
    (mutationMarkNumber
      ? `${mutationMarkNumber} (${mutationMarkNumberDescription})`
      : undefined)

  return locked ? (
    <LockedInputDataItem
      name={'mutationMark'}
      value={value}
      editableData={{
        DialogContent: (
          <Field
            defaultValue={value}
            disabled={disabled || props.disabled}
            {...props}
          />
        ),
        fieldName: t('specimens_overview.mutation_mark'),
        saveChange: () => {
          const mutationMark = getValues('mutationMark_internal')
          const mutationMarkNumber = getValues('mutationMarkNumber_internal')
          const mutationMarkNumberDescription = getValues(
            'mutationMarkNumberDescription_internal'
          )
          setValue('mutationMark', mutationMark)
          setValue('mutationMarkNumber', mutationMarkNumber)
          setValue(
            'mutationMarkNumberDescription',
            mutationMarkNumberDescription
          )

          setMutationMark(mutationMark)
          setMutationMarkNumber(mutationMarkNumber)
          setMutationMarkNumberDescription(mutationMarkNumberDescription)
          setSpecimensState(
            specimensState.map((specimen) => ({
              ...specimen,
              mutationMark,
              mutationMarkNumber,
              mutationMarkNumberDescription,
            })),
            true
          )
        },
      }}
    />
  ) : (
    <Field
      defaultValue={value}
      disabled={disabled || props.disabled}
      {...props}
    />
  )
}

export default InputDataMutationMarkField
