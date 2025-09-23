import { Controller, useFormContext } from 'react-hook-form'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import LockedInputDataItem from './LockedInputDataItem'

type Props = { name: string; options: string[]; disabled?: boolean }

const InputDataAutocomplete = ({ name, options, ...props }: Props) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { control } = useFormContext()

  return locked ? (
    <LockedInputDataItem name={name} />
  ) : (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Autocomplete
          freeSolo
          options={options}
          disabled={disabled || locked || props.disabled}
          size="small"
          sx={{ minWidth: '200px' }}
          value={field.value ?? ''}
          onChange={(_, newValue) => field.onChange(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="" onBlur={field.onBlur} />
          )}
        />
      )}
    />
  )
}

export default InputDataAutocomplete
