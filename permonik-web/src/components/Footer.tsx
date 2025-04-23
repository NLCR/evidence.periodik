import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

const Footer = () => {
  return (
    <Box
      sx={{
        height: '40px',
      }}
    >
      <Container
        sx={{
          padding: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
          }}
        >
          Copyright Permonik 2023
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
