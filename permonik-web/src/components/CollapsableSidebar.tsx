import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { SxProps, Theme } from '@mui/material'
import React, { PropsWithChildren, useState } from 'react'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import blue from '@mui/material/colors/blue'

type Props = { sx?: SxProps<Theme> }

const CollapsableSidebar = ({
  sx = {},
  children,
}: Props & PropsWithChildren) => {
  const [open, setOpen] = useState(window.innerWidth > 720)

  return (
    <Box
      sx={{
        width: open ? '380px' : '70px',
        height: open ? '100%' : '70px',
        transition: 'all 0.3s ease',
        marginLeft: open ? 0 : -5,
        padding: 2,
        backgroundColor: 'white',
        borderRadius: 2,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <IconButton
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <MenuOpenIcon
          sx={{
            transition: 'transform 0.3s',
            transform: `rotate(${open ? '0deg' : '180deg'})`,
            color: blue[900],
            fontSize: 24,
          }}
        />
      </IconButton>

      <Box
        sx={{
          position: 'absolute',
          transition: 'opacity 0.2s',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          width: '90%',
          height: '100%',
          paddingBottom: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default CollapsableSidebar
