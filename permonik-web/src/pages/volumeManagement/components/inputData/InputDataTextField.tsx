import LockedInputDataItem from './LockedInputDataItem'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'

const InputDataTextField = (props: TextFieldProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()

  return locked ? (
    <LockedInputDataItem value={props.value ? props.value.toString() : '-'} />
  ) : (
    <TextField
      variant="outlined"
      size="small"
      sx={{
        maxWidth: '200px',
        width: '100%',
      }}
      disabled={disabled}
      {...props}
    />
  )
}

export default InputDataTextField
