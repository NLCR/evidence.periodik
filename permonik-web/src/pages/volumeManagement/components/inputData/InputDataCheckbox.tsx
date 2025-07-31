import { Controller, useFormContext } from 'react-hook-form'
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
  const { control } = useFormContext()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Checkbox
            size="small"
            sx={{
              cursor: disabled || locked ? 'not-allowed' : 'pointer',
            }}
            disabled={disabled || locked}
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            inputRef={field.ref}
            {...props}
          />
        )}
      />
      {label && <div>{label}</div>}
    </Box>
  )
}

export default InputDataCheckbox
