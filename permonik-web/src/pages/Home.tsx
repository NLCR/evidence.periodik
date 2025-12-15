import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Link as ReactLink } from 'react-router-dom'
import dayjs from 'dayjs'
import { useMetaTitleOverviewListQuery } from '../api/metaTitle'
import Loader from '../components/Loader'
import ShowError from '../components/ShowError'
import ShowInfoMessage from '../components/ShowInfoMessage'
import { APP_WITH_EDITING_ENABLED } from '../utils/constants'
import Grid from '@mui/material/Grid'
import theme from '../theme'

const Home = () => {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError, refetch } = useMetaTitleOverviewListQuery()

  return (
    <Box
      sx={{
        textAlign: 'center',
        paddingTop: '50px',
        marginY: '-1rem',
        width: '100%',
        overflow: 'auto',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: theme.palette.primary.main,
        }}
      >
        {APP_WITH_EDITING_ENABLED ? t('home.title_admin') : t('home.title')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {APP_WITH_EDITING_ENABLED
          ? t('home.description_admin')
          : t('home.description')}
      </Typography>
      {isLoading ? <Loader /> : null}
      {isError && !isLoading ? <ShowError onRetry={refetch} /> : null}
      {data && !isLoading && !isError ? (
        <Grid
          container
          spacing={2}
          justifyContent={'center'}
          sx={{
            marginTop: 10,
            paddingBottom: 4,
          }}
        >
          {data.map((mt) => (
            <Grid
              width={'100%'}
              maxWidth={'22rem'}
              component={mt.specimens.matchedSpecimens > 0 ? ReactLink : Box}
              to={`/${i18n.resolvedLanguage}/${t('urls.specimens_overview')}/${
                mt.id
              }`}
              key={mt.id}
              sx={(theme) => ({
                color: theme.palette.grey['900'],
                textDecoration: 'none',
                padding: theme.spacing(2),
                backgroundColor: 'white',
                textAlign: 'left',
                borderRadius: theme.spacing(2),
                boxShadow: theme.shadows[1],
                transition: 'all 0.2s',
                ':hover': {
                  boxShadow: theme.shadows[3],
                  cursor: 'pointer',
                },
              })}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                {mt.name}
              </Typography>
              {mt.specimens.publicationDayMin &&
              mt.specimens.publicationDayMax ? (
                <Typography
                  sx={(theme) => ({
                    fontSize: '12px',
                    color: theme.palette.grey['600'],
                  })}
                >
                  {`${dayjs(mt.specimens.publicationDayMin).format(
                    'DD. MMMM YYYY'
                  )} - ${dayjs(mt.specimens.publicationDayMax).format(
                    'DD. MMMM YYYY'
                  )}`}
                </Typography>
              ) : null}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.25rem',
                }}
              >
                <Typography
                  sx={{
                    color: theme.palette.primary.light,
                  }}
                >
                  {t('home.specimens')}: {mt.specimens.matchedSpecimens}
                </Typography>
                <Typography>
                  {t('home.mutations')}: {mt.specimens.mutationsCount}
                </Typography>
                <Typography>
                  {t('home.owners')}: {mt.specimens.ownersCount}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : null}
      {!isLoading && !isError && !data ? (
        <ShowInfoMessage message={t('home.no_meta_titles_found')} />
      ) : null}
    </Box>
  )
}

export default Home
