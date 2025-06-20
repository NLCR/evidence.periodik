import LockedInputDataItem from './LockedInputDataItem'
import Select, { SelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'

type Props = {
  options: { key: string; value: string }[]
}

const InputDataSelect = ({
  options,
  ...props
}: Props & SelectProps<string>) => {
  const { locked, disabled } = useInputDataEditabilityContext()

  return locked ? (
    <LockedInputDataItem
      value={options.find((option) => option.key === props.value)?.value}
    />
  ) : (
    <Select
      variant="outlined"
      size="small"
      sx={{
        maxWidth: '200px',
        width: '100%',
      }}
      disabled={disabled}
      {...props}
    >
      {options.map((o) => (
        <MenuItem key={o.key} value={o.key}>
          {o.value}
        </MenuItem>
      ))}
    </Select>
  )
}

export default InputDataSelect
