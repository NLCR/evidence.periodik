import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Loader from '../../components/Loader'
import { hasPermission, type TMe } from '../../schema/user'

const Container = styled('div')(({ theme }) => ({
  backgroundColor: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  marginBottom: '5px',
  // height: '80vh',
}))

const Menu = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}))

const Link = styled(NavLink)(({ theme }) => ({
  display: 'block',
  lineHeight: 1,
  padding: `${theme.spacing(1.25)} ${theme.spacing(2.25)}`,
  borderRadius: theme.shape.borderRadius,
  textDecoration: 'none',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.grey['200'],
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

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(1.25),
  marginBottom: theme.spacing(2.5),
  borderColor: theme.palette.grey[300],
}))

const Administration = ({ me }: { me: TMe }) => {
  const { t, i18n } = useTranslation()

  return (
    <Container>
      <Menu>
        {hasPermission(me, 'USER_READ') ? (
          <Link
            to={`/${i18n.resolvedLanguage}/${t('urls.administration')}/${t('urls.users')}`}
          >
            {t('administration.users')}
          </Link>
        ) : null}
        {hasPermission(me, 'REFERENCE_WRITE') ? (
          <>
            <Link
              to={`/${i18n.resolvedLanguage}/${t('urls.administration')}/${t('urls.owners')}`}
            >
              {t('administration.owners')}
            </Link>
            <Link
              to={`/${i18n.resolvedLanguage}/${t('urls.administration')}/${t('urls.meta_titles')}`}
            >
              {t('administration.meta_titles')}
            </Link>
            <Link
              to={`/${i18n.resolvedLanguage}/${t('urls.administration')}/${t('urls.editions')}`}
            >
              {t('administration.editions')}
            </Link>
            <Link
              to={`/${i18n.resolvedLanguage}/${t('urls.administration')}/${t('urls.mutations')}`}
            >
              {t('administration.mutations')}
            </Link>
          </>
        ) : null}
      </Menu>
      <StyledDivider />
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </Container>
  )
}

export default Administration
