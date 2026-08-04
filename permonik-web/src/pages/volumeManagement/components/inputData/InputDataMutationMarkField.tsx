import LockedInputDataItem from './LockedInputDataItem'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useState } from 'react'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  getMutationMarkCompoundValue,
  hasMutationMark,
  type TMutationMark,
} from '../../../../utils/mutationMark'

type FieldProps = {
  disabled?: boolean
  avoidInternal?: boolean
}

const Field = ({
  disabled = false,
  avoidInternal = false,
  ...props
}: FieldProps & TextFieldProps) => {
  const [isModalOpened, setIsModalOpened] = useState(false)
  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const { setValue, control } = useFormContext()

  const fieldName = avoidInternal ? 'mutationMark' : 'mutationMark_internal'

  const mutationMark = useWatch({ name: fieldName, control })
  const value = getMutationMarkCompoundValue(mutationMark)

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

      {isModalOpened && (
        <MutationMarkSelectorModal
          row={{
            ...volumeState,
            mutationMark: mutationMark ?? volumeState.mutationMark,
          }}
          open={isModalOpened}
          onClose={() => setIsModalOpened(false)}
          onSave={(data) => {
            setValue(fieldName, data.mutationMark, {
              shouldDirty: true,
            })
          }}
        />
      )}
    </>
  )
}

const InputDataMutationMarkField = (props: TextFieldProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { getValues, control, setValue } = useFormContext()

  const setMutationMark = useVolumeManagementStore(
    (state) => state.volumeActions.setMutationMark
  )
  const { t } = useTranslation()

  const specimensState = useVolumeManagementStore(
    (state) => state.specimensState
  )
  const setSpecimensState = useVolumeManagementStore(
    (state) => state.specimensActions.setSpecimensState
  )

  const mutationMark = useWatch({
    name: 'mutationMark',
    control,
  }) as TMutationMark
  const value = getMutationMarkCompoundValue(mutationMark)

  return locked ? (
    <LockedInputDataItem
      name={'mutationMark'}
      value={value ?? (props.defaultValue as string) ?? ''}
      editableData={{
        isMutationMark: true,
        DialogContent: <Field defaultValue={value} {...props} />,
        fieldName: t('specimens_overview.mutation_mark'),
        saveChange: () => {
          const mutationMark = getValues('mutationMark_internal')

          setValue('mutationMark', mutationMark)
          setMutationMark(mutationMark)
          setSpecimensState(
            specimensState.map((specimen) =>
              specimen.isAttachment && !hasMutationMark(specimen.mutationMark)
                ? // do not modify attachments w/o a mutation mark
                  specimen
                : {
                    ...specimen,
                    mutationMark,
                  }
            ),
            true
          )
        },
      }}
    />
  ) : (
    <Field
      defaultValue={value}
      avoidInternal
      disabled={disabled || props.disabled}
      {...props}
    />
  )
}

export default InputDataMutationMarkField
