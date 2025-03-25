import Header from './Header'
import Container from '@mui/material/Container'
import ScrollToTop from './ScrollToTop'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          // flexDirection: 'column',
          paddingTop: '15px',
          paddingBottom: '10px',
          maxHeight: `1200px`,
          height: `calc(100vh - 80px)`,
          width: '100%',
          // maxHeight: `700px`,
          // overflow: 'hidden',
        }}
      >
        <ScrollToTop />
        <Outlet />
      </Container>
      {/* <Footer /> */}
    </>
  )
}

export default Layout
