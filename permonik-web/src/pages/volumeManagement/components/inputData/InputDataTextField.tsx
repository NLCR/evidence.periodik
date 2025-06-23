import LockedInputDataItem from './LockedInputDataItem'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { ChangeEventHandler, useEffect, useState } from 'react'
import MutationMarkSelectorModal from '../editCells/MutationMarkSelectorModal'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'

type FieldProps = {
  isMutationMarkInputTextField?: boolean
  disabled?: boolean
  value: string | unknown
  onChange:
    | ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
    | undefined
}

const Field = ({
  isMutationMarkInputTextField = false,
  value,
  onChange,
  disabled = false,
  ...props
}: FieldProps & TextFieldProps) => {
  const [isModalOpened, setIsModalOpened] = useState(false)
  const volumeState = useVolumeManagementStore((state) => state.volumeState)

  return (
    <>
      <TextField
        variant="outlined"
        size="small"
        sx={{
          maxWidth: '200px',
          width: '100%',
        }}
        disabled={disabled}
        {...props}
        value={value}
        onChange={onChange}
        onClick={() =>
          isMutationMarkInputTextField ? setIsModalOpened(true) : {}
        }
      />
      {isMutationMarkInputTextField && (
        <MutationMarkSelectorModal
          row={volumeState}
          open={isModalOpened}
          onClose={() => setIsModalOpened(false)}
          onSave={(data) =>
            onChange &&
            onChange({
              target: { value: data.mutationMark },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        />
      )}
    </>
  )
}

type Props = {
  isMutationMarkInputTextField?: boolean
  editableData?: { fieldName: string; saveChange: (value: string) => void }
}

const InputDataTextField = ({
  isMutationMarkInputTextField = false,
  editableData = undefined,
  ...props
}: TextFieldProps & Props) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const [input, setInput] = useState<string>(props.value as string)

  useEffect(() => {
    setInput(props.value as string)
  }, [props.value])

  return locked ? (
    <LockedInputDataItem
      value={props.value ? props.value.toString() : '-'}
      editableData={
        editableData
          ? {
              DialogContent: (
                <Field
                  isMutationMarkInputTextField={isMutationMarkInputTextField}
                  {...props}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                  }}
                />
              ),
              fieldName: editableData.fieldName,
              saveChange: () => editableData.saveChange(input),
            }
          : undefined
      }
    />
  ) : (
    <Field
      isMutationMarkInputTextField={isMutationMarkInputTextField}
      disabled={disabled}
      onChange={props.onChange}
      value={props.value}
      {...props}
    />
  )
}

export default InputDataTextField
