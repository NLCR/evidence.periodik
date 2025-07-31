import { useFormContext } from 'react-hook-form'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'
import Box from '@mui/material/Box'

type Props = { name: string; label?: string }

const InputDataCheckbox = ({
  name,
  label = undefined,
  ...props
}: Props & CheckboxProps) => {
  const { locked, disabled } = useInputDataEditabilityContext()
  const { watch, setValue } = useFormContext()

  const value = watch(name)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Checkbox
        size="small"
        sx={{
          // marginTop: 1,
          // marginBottom: 1,
          cursor: disabled || locked ? 'not-allowed' : 'pointer',
          // width: '100%',
        }}
        disabled={disabled || locked}
        checked={value}
        onChange={(e) =>
          setValue(name, e.target.checked, { shouldDirty: true })
        }
        {...props}
      />
      {label && <div>{label}</div>}
    </Box>
  )
}

export default InputDataCheckbox
