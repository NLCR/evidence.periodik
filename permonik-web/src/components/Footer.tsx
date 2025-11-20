import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import MailIcon from '@mui/icons-material/Mail'

import NkLogo from '../assets/images/nkcr_logo.png'

const Footer = () => {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        height: '50px',
        zIndex: 100,
        boxShadow: 4,
      }}
    >
      <Container
        sx={{
          padding: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-center',
        }}
      >
        <img alt="Logo NKČR" src={NkLogo} style={{ paddingRight: 50 }} />
        <Typography
          sx={{
            fontSize: '12px',
            maxWidth: '35rem',
            textAlign: 'center',
          }}
        >
          {t('footer.dedication')}
        </Typography>
        <Typography
          sx={{
            fontSize: '12px',
            maxWidth: '10rem',
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <a href={`mailto:permonik.admin@nkp.cz`} style={{ color: 'black' }}>
            <MailIcon
              sx={{ paddingTop: 0, marginBottom: -0.9, opacity: 0.5 }}
            />{' '}
            permonik.admin@nkp.cz
          </a>
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
