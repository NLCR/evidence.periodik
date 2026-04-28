import Box from '@mui/material/Box'
import Button, { ButtonProps } from '@mui/material/Button'
import { ReactElement, ReactNode } from 'react'

type ResponsiveActionButtonProps = ButtonProps & {
  label: ReactNode
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
