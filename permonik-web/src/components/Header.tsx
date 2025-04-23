import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
// import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Container from '@mui/material/Container'
import { styled } from '@mui/material/styles'
// import MenuIcon from '@mui/icons-material/Menu'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { blue } from '@mui/material/colors'
import Logo from '../assets/logo.png'
import Czech from '../assets/images/czech-republic.png'
import Slovakia from '../assets/images/slovakia.png'
import English from '../assets/images/united-states.png'
import { changeAppLanguage, TSupportedLanguages } from '../i18next'
import { useLogoutMutation, useMeQuery } from '../api/user'
import { queryClient } from '../api'
import { APP_WITH_EDITING_ENABLED, LOGIN_URL } from '../utils/constants'

const HeaderContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}))

const LinksContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('xs')]: {
    display: 'none',
  },
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
}))

// const BurgerContainer = styled(IconButton)(({ theme }) => ({
//   [theme.breakpoints.up('sm')]: {
//     display: 'none',
//   },
// }))

const NavLinkStyled = styled(NavLink)(({ theme }) => ({
  display: 'block',
  // lineHeight: 1,
  padding: theme.spacing(1.1, 2.25),
  marginLeft: theme.spacing(1.25),
  marginRight: theme.spacing(1.25),
  borderRadius: theme.shape.borderRadius,
  textDecoration: 'none',
  color: theme.palette.grey['900'],
  backgroundColor: theme.palette.grey['50'],
  fontSize: theme.typography.fontSize,
  fontWeight: theme.typography.fontWeightMedium,
  '&:hover': {
    color: theme.palette.grey['50'],
    backgroundColor: theme.palette.grey['900'],
  },
  '&.active': {
    color: theme.palette.grey['50'],
    backgroundColor: theme.palette.grey['900'],
  },
}))

// const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
//   color: theme.palette.grey['50'],
//   backgroundColor: theme.palette.grey['900'],
// }))

const LanguageButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(3.75),
  width: theme.spacing(25),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.75, 2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.short,
  }),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: blue['50'],
  },
}))

const data: { shorthand: TSupportedLanguages; label: string; image: string }[] =
  [
    { shorthand: 'cs', label: 'Czech', image: Czech },
    { shorthand: 'sk', label: 'Slovak', image: Slovakia },
    { shorthand: 'en', label: 'English', image: English },
  ]

const Header = () => {
  const navigate = useNavigate()
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null)
  // const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)
  const { t, i18n } = useTranslation()
  const { data: me } = useMeQuery()
  const { mutateAsync: doLogout } = useLogoutMutation()

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget)
  }

  const handleLangMenuClose = () => {
    setLangAnchorEl(null)
  }

  // const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  //   setMenuAnchorEl(event.currentTarget)
  // }
  //
  // const handleMenuClose = () => {
  //   setMenuAnchorEl(null)
  // }

  const handleLogout = async () => {
    try {
      await doLogout()
      navigate('/')
      queryClient.invalidateQueries({ queryKey: ['me'] })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* empty */
    }
  }

  const items = data.map((item) => (
    <MenuItem
      key={item.label}
      onClick={() => changeAppLanguage(item.shorthand)}
    >
      <Avatar
        src={item.image}
        alt={item.label}
        sx={{ width: 24, height: 24, marginRight: 1 }}
      />
      {item.label}
    </MenuItem>
  ))

  return (
    <HeaderContainer position="static">
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Link to={`/${i18n.resolvedLanguage}/`}>
            <img src={Logo} alt="Logo" />
          </Link>
          <Box>
            <LinksContainer>
              <NavLinkStyled to={`/${i18n.resolvedLanguage}/`} end>
                {t('header.home')}
              </NavLinkStyled>
              {APP_WITH_EDITING_ENABLED && me?.role?.includes('admin') ? (
                <NavLinkStyled
                  sx={{
                    marginRight: 0,
                  }}
                  to={`/${i18n.resolvedLanguage}/${t('urls.administration')}`}
                >
                  {t('header.administration')}
                </NavLinkStyled>
              ) : null}
              {!me && APP_WITH_EDITING_ENABLED && (
                <Button
                  variant="contained"
                  sx={(theme) => ({
                    color: theme.palette.grey['900'],
                    backgroundColor: theme.palette.grey['50'],
                    '&:hover': {
                      color: theme.palette.grey['50'],
                      backgroundColor: theme.palette.grey['900'],
                    },
                  })}
                  onClick={() => {
                    window.location.href = LOGIN_URL
                  }}
                >
                  {t('header.login')}
                </Button>
              )}
              {me && APP_WITH_EDITING_ENABLED && (
                <>
                  <NavLinkStyled
                    sx={{
                      marginRight: 0,
                    }}
                    to={`/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/`}
                  >
                    {t('header.volume')}
                  </NavLinkStyled>
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={(theme) => ({
                      margin: '0 20px',
                      borderColor: theme.palette.grey['50'],
                    })}
                  />
                  <Button
                    variant="contained"
                    onClick={handleLogout}
                    sx={(theme) => ({
                      color: theme.palette.grey['900'],
                      backgroundColor: theme.palette.grey['50'],
                      '&:hover': {
                        color: theme.palette.grey['50'],
                        backgroundColor: theme.palette.grey['900'],
                      },
                    })}
                  >
                    {t('header.logout')}
                  </Button>
                  <Typography variant="body1" sx={{ marginLeft: '20px' }}>
                    {me.name}
                  </Typography>
                </>
              )}
              <LanguageButton onClick={handleLangMenuOpen}>
                <Avatar
                  src={
                    data.find((l) => l.shorthand === i18n.resolvedLanguage)
                      ?.image
                  }
                  alt={
                    data.find((l) => l.shorthand === i18n.resolvedLanguage)
                      ?.label
                  }
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="body2">
                  {
                    data.find((l) => l.shorthand === i18n.resolvedLanguage)
                      ?.label
                  }
                </Typography>
                <ExpandMoreIcon />
              </LanguageButton>
              <Menu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={handleLangMenuClose}
              >
                {items}
              </Menu>
            </LinksContainer>
            {/* <BurgerContainer */}
            {/*  edge="end" */}
            {/*  color="inherit" */}
            {/*  aria-label="menu" */}
            {/*  onClick={handleMenuOpen} */}
            {/* > */}
            {/*  <MenuIcon /> */}
            {/* </BurgerContainer> */}
            {/* <Menu */}
            {/*  anchorEl={menuAnchorEl} */}
            {/*  open={Boolean(menuAnchorEl)} */}
            {/*  onClose={handleMenuClose} */}
            {/* > */}
            {/*  <MenuItem component={NavLink} to={`/${i18n.resolvedLanguage}/`}> */}
            {/*    {t('header.home')} */}
            {/*  </MenuItem> */}
            {/*  {me?.role === 'admin' && ( */}
            {/*    <MenuItem */}
            {/*      component={NavLink} */}
            {/*      to={`/${i18n.resolvedLanguage}/${t('urls.administration')}`} */}
            {/*    > */}
            {/*      {t('header.administration')} */}
            {/*    </MenuItem> */}
            {/*  )} */}
            {/*  {!me && <a href="/login/shibboleth">{t('header.login')}</a>} */}
            {/*  {me && ( */}
            {/*    <> */}
            {/*      <MenuItem onClick={handleLogout}> */}
            {/*        {t('header.logout')} */}
            {/*      </MenuItem> */}
            {/*      <Typography variant="body1" sx={{ marginLeft: 1 }}> */}
            {/*        {me.name} */}
            {/*      </Typography> */}
            {/*    </> */}
            {/*  )} */}
            {/* </Menu> */}
          </Box>
        </Toolbar>
      </Container>
    </HeaderContainer>
  )
}

export default Header
