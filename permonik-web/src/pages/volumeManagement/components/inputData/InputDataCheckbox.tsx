import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'

const InputDataCheckbox = (props: CheckboxProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()

  return (
    <Checkbox
      size="small"
      sx={{
        // marginTop: 1,
        // marginBottom: 1,
        cursor: 'pointer',
        // width: '100%',
      }}
      disabled={disabled || locked}
      {...props}
    />
  )
}

export default InputDataCheckbox
