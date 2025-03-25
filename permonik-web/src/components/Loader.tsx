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

const Loader = () => {
  const bars = Array.from({ length: 5 })

  return (
    <Box
      sx={{
        margin: '50px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '50px',
        height: '40px',
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
