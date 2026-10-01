import Box from '@mui/material/Box'
import Button, { type ButtonProps } from '@mui/material/Button'
import { type ReactElement } from 'react'

type ResponsiveActionButtonProps = ButtonProps & {
  label: string
  icon: ReactElement
}

const ResponsiveActionButton = ({
  label,
  icon,
  sx,
  ...buttonProps
}: ResponsiveActionButtonProps) => {
  return (
    <Button
      {...buttonProps}
      aria-label={label}
      startIcon={
        <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>{icon}</Box>
      }
      sx={{ minWidth: { xs: 0, sm: 'auto' }, ...sx }}
    >
      <Box component="span" sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        {icon}
      </Box>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {label}
      </Box>
    </Button>
  )
}

export default ResponsiveActionButton
