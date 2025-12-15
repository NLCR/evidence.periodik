import Header from './Header'
import Container from '@mui/material/Container'
import ScrollToTop from './ScrollToTop'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'

const Layout = () => {
  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          paddingY: '1rem',
          maxHeight: `1200px`,
          height: `calc(100vh - 115px)`,
          width: '100%',
          paddingX: { xs: 0.25, sm: 2 },
        }}
      >
        <ScrollToTop />
        <Outlet />
      </Container>
      <Footer />
    </>
  )
}

export default Layout
