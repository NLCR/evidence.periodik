import LockedInputDataItem from './LockedInputDataItem'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useState } from 'react'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { Controller, useFormContext } from 'react-hook-form'

type FieldProps = {
  disabled?: boolean
  name: string
  onChangeCallback?: (value: string) => void
}

const Field = ({
  name,
  disabled = false,
  onChangeCallback = undefined,
  ...props
}: FieldProps & TextFieldProps) => {
  const { control } = useFormContext()

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
              width: '100%',
            }}
            disabled={disabled}
            {...props}
            value={field.value ?? ''}
            onChange={(e) => {
              field.onChange(e)
              if (onChangeCallback) onChangeCallback(e.target.value)
            }}
            onBlur={field.onBlur}
            inputRef={field.ref}
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
    </>
  )
}

type Props = {
  name: string
  isMutationMarkInputTextField?: boolean
  editableData?: { fieldName: string; saveChange: (value: string) => void }
  onChangeCallback?: (value: string) => void
}

const InputDataTextField = ({
  name,
  editableData = undefined,
  onChangeCallback = undefined,
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
                  fullWidth
                  name={name + '_internal'}
                  defaultValue={getValues(name)}
                  onChangeCallback={onChangeCallback}
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
      disabled={disabled || props.disabled}
      name={name}
      onChangeCallback={onChangeCallback}
      {...props}
    />
  )
}

export default InputDataTextField
