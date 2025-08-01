import LockedInputDataItem from './LockedInputDataItem'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useState } from 'react'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { Controller, useFormContext } from 'react-hook-form'

type FieldProps = {
  isMutationMarkInputTextField?: boolean
  disabled?: boolean
  name: string
}

const Field = ({
  isMutationMarkInputTextField = false,
  name,
  disabled = false,
  ...props
}: FieldProps & TextFieldProps) => {
  const [isModalOpened, setIsModalOpened] = useState(false)
  const volumeState = useVolumeManagementStore((state) => state.volumeState)
  const { control, setValue } = useFormContext()

  return (
    <>
      <Controller
        control={control}
        name={name}
        defaultValue={props.defaultValue}
        render={({ field }) => (
          <TextField
            variant="outlined"
            size="small"
            sx={{
              maxWidth: '200px',
              width: '100%',
            }}
            disabled={disabled}
            {...props}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            onClick={() =>
              isMutationMarkInputTextField ? setIsModalOpened(true) : undefined
            }
            onBeforeInput={
              props.inputMode === 'decimal'
                ? (e) => {
                    if (!/\d/.test((e.nativeEvent as InputEvent).data || '')) {
                      e.preventDefault()
                    }
                  }
                : undefined
            }
          />
        )}
      />
      {isMutationMarkInputTextField && (
        <MutationMarkSelectorModal
          row={volumeState}
          open={isModalOpened}
          onClose={() => setIsModalOpened(false)}
          onSave={(data) =>
            setValue(name, data.mutationMark, { shouldDirty: true })
          }
        />
      )}
    </>
  )
}

type Props = {
  name: string
  isMutationMarkInputTextField?: boolean
  editableData?: { fieldName: string; saveChange: (value: string) => void }
}

const InputDataTextField = ({
  name,
  isMutationMarkInputTextField = false,
  editableData = undefined,
  ...props
}: TextFieldProps & Props) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { getValues, setValue } = useFormContext()

  return locked ? (
    <LockedInputDataItem
      name={name}
      editableData={
        editableData
          ? {
              DialogContent: (
                <Field
                  isMutationMarkInputTextField={isMutationMarkInputTextField}
                  name={name + '_internal'}
                  defaultValue={getValues(name)}
                  {...props}
                />
              ),
              fieldName: editableData.fieldName,
              saveChange: () => {
                setValue(name, getValues(name + '_internal'))
                editableData.saveChange(getValues(name))
              },
            }
          : undefined
      }
    />
  ) : (
    <Field
      isMutationMarkInputTextField={isMutationMarkInputTextField}
      disabled={disabled || props.disabled}
      name={name}
      {...props}
    />
  )
}

export default InputDataTextField
