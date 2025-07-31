import LockedInputDataItem from './LockedInputDataItem'
import Select, { SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useFormContext } from 'react-hook-form'

type FieldProps = {
  name: string
  options: { key: string; value: string }[]
  disabled?: boolean
}

const Field = ({
  name,
  options,
  disabled = false,
  ...props
}: FieldProps & SelectProps<string>) => {
  const { register, watch, setValue } = useFormContext()
  const value = watch(name)

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
        {...register(name)}
        value={value ?? ''}
        onChange={(event) =>
          setValue(name, event.target.value, { shouldDirty: true })
        }
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
  name: string
  options: { key: string; value: string }[]
  editableData?: { fieldName: string; saveChange: (value: string) => void }
}

const InputDataSelect = ({
  name,
  options,
  editableData = undefined,
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
    <Field disabled={disabled} options={options} {...props} name={name} />
  )
}

export default InputDataSelect
