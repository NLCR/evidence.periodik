import { useFormContext } from 'react-hook-form'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'

type Props = { name: string }

const InputDataCheckbox = ({ name, ...props }: Props & CheckboxProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { register, watch } = useFormContext()
  const checked = watch(name)

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
      checked={checked}
      {...register(name)}
    />
  )
}

export default InputDataCheckbox
