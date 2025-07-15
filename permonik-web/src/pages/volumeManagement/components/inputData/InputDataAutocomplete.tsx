import { useFormContext } from 'react-hook-form'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'

import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import LockedInputDataItem from './LockedInputDataItem'

type Props = { name: string; options: string[] }

const InputDataAutocomplete = ({ name, options }: Props) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { register, setValue, watch } = useFormContext()

  const value = watch(name)

  return locked ? (
    <LockedInputDataItem name={name} />
  ) : (
    <Autocomplete
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          onBlur={(event) => setValue(name, event.target.value)}
        />
      )}
      sx={{
        minWidth: '200px',
      }}
      size="small"
      disabled={disabled || locked}
      options={options}
      value={value}
      {...register(name)}
    />
  )
}

export default InputDataAutocomplete
