import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { type ReactNode, useState } from 'react'

type TAction = {
  disabled?: boolean
  label: ReactNode
  onClick: () => void
}

type Props = {
  actions: TAction[]
  disabled?: boolean
}

const ActionsMenu = ({ actions, disabled = false }: Props) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)

  const closeMenu = () => setAnchorElement(null)

  return (
    <>
      <IconButton
        aria-label="actions"
        disabled={disabled}
        onClick={(event) => setAnchorElement(event.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorElement} open={!!anchorElement} onClose={closeMenu}>
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            disabled={action.disabled}
            onClick={() => {
              action.onClick()
              closeMenu()
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default ActionsMenu
