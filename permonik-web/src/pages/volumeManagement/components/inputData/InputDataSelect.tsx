import LockedInputDataItem from './LockedInputDataItem'
import Select, { SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { Controller, useFormContext } from 'react-hook-form'

type FieldProps = {
  name: string
  options: { key: string; value: string }[]
  disabled?: boolean

  onChangeCallback?: (value: string) => void
}

const Field = ({
  name,
  options,
  disabled = false,
  onChangeCallback = undefined,
  ...props
}: FieldProps & SelectProps<string>) => {
  const { control } = useFormContext()

  return (
    <>
      <Controller
        control={control}
        name={name}
        defaultValue={props.defaultValue}
        render={({ field }) => (
          <Select
            fullWidth
            variant="outlined"
            size="small"
            sx={{
              maxWidth: 'auto',
              width: '100%',
            }}
            disabled={disabled}
            {...props}
            value={field.value ?? ''}
            onChange={(event) => {
              field.onChange(event.target.value)
              if (onChangeCallback) onChangeCallback(event.target.value)
            }}
            onBlur={field.onBlur}
            inputRef={field.ref}
          >
            {options.map((o) => (
              <MenuItem key={o.key} value={o.key}>
                {o.value}
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </>
  )
}

type Props = {
  name: string
  options: { key: string; value: string }[]
  editableData?: { fieldName: string; saveChange: (value: string) => void }
  onChangeCallback?: (value: string) => void
}

const InputDataSelect = ({
  name,
  options,
  editableData = undefined,
  onChangeCallback = undefined,
  ...props
}: Props & SelectProps<string>) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { getValues, setValue } = useFormContext()

  return locked ? (
    <LockedInputDataItem
      name={name}
      type="SELECT"
      selectOptions={options}
      editableData={
        editableData
          ? {
              fieldName: editableData.fieldName,
              saveChange: () => {
                setValue(name, getValues(name + '_internal'))
                editableData.saveChange(getValues(name))
              },
              DialogContent: (
                <Field
                  disabled={disabled}
                  options={options}
                  defaultValue={getValues(name)}
                  {...props}
                  name={name + '_internal'}
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
      {...props}
      name={name}
      onChangeCallback={onChangeCallback}
    />
  )
}

export default InputDataSelect
