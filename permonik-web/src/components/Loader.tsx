/* eslint-disable react/no-array-index-key */
import Box from '@mui/material/Box'
import { keyframes } from '@emotion/react'

const barsAnimation = keyframes`
  0%, 40%, 100% { 
    transform: scaleY(0.4);
  } 20% { 
    transform: scaleY(1.0);
  }
`

type Props = { size?: 'small' | 'normal' }

const Loader = ({ size = 'normal' }: Props) => {
  const bars = Array.from({ length: 5 })

  return (
    <Box
      sx={{
        margin: size === 'small' ? 'auto' : '50px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: size === 'small' ? '1.5rem' : '50px',
        height: size === 'small' ? '1rem' : '40px',
      }}
    >
      {bars.map((_, index) => (
        <Box
          key={index}
          sx={{
            backgroundColor: 'primary.main',
            height: '100%',
            width: '6px',
            borderRadius: '4px',
            animation: `${barsAnimation} 1.2s infinite ease-in-out`,
            animationDelay: `${-1.1 + index * 0.1}s`,
          }}
        />
      ))}
    </Box>
  )
}

export default Loader
