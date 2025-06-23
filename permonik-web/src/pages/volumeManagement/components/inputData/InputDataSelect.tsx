import LockedInputDataItem from './LockedInputDataItem'
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { ReactNode, useEffect, useState } from 'react'

type FieldProps = {
  options: { key: string; value: string }[]
  disabled?: boolean
  value: string | unknown
  onChange:
    | ((event: SelectChangeEvent<string>, child: ReactNode) => void)
    | undefined
}

const Field = ({
  options,
  value,
  onChange,
  disabled = false,
  ...props
}: FieldProps & SelectProps<string>) => {
  return (
    <>
      <Select
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
      >
        {options.map((o) => (
          <MenuItem key={o.key} value={o.key}>
            {o.value}
          </MenuItem>
        ))}
      </Select>
    </>
  )
}

type Props = {
  options: { key: string; value: string }[]
  editableData?: { fieldName: string; saveChange: (value: string) => void }
}

const InputDataSelect = ({
  options,
  editableData = undefined,
  ...props
}: Props & SelectProps<string>) => {
  const { locked, disabled } = useInputDataEditabilityContext()

  const [input, setInput] = useState<string>(props.value as string)

  useEffect(() => {
    setInput(props.value as string)
  }, [props.value])

  return locked ? (
    <LockedInputDataItem
      value={options.find((option) => option.key === props.value)?.value}
      editableData={
        editableData
          ? {
              fieldName: editableData.fieldName,
              saveChange: () => editableData.saveChange(input),
              DialogContent: (
                <Field
                  disabled={disabled}
                  options={options}
                  {...props}
                  value={input as string}
                  onChange={(e) => {
                    setInput(e.target.value as string)
                  }}
                />
              ),
            }
          : undefined
      }
    />
  ) : (
    <Field
      disabled={disabled}
      options={options}
      value={props.value}
      onChange={props.onChange}
      {...props}
    />
  )
}

export default InputDataSelect
