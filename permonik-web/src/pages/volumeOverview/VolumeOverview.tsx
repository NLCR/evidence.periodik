import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
undefined
undefined
undefined
undefined
undefined
undefined
import SpecimensTable from './components/Table'
undefined
import InputData from './components/InputData'
undefined

const VolumeOverview = () => {
  const { volumeId } = useParams()
  const { t } = useTranslation()

  const {
    data: mutations,
    isLoading: mutationsLoading,
    isError: mutationsError,
  } = useMutationListQuery()
  const {
    data: owners,
    isLoading: ownersLoading,
    isError: ownersError,
  } = useOwnerListQuery()

  const {
    data: volume,
    isLoading: volumeLoading,
    isError: volumeError,
  } = usePublicVolumeDetailQuery(volumeId)
  const {
    data: metaTitles,
    isLoading: metaTitlesLoading,
    isError: metaTitlesError,
  } = useMetaTitleListQuery()

  if (volumeLoading || mutationsLoading || ownersLoading || metaTitlesLoading)
    return <Loader />
  if (volumeError || mutationsError || ownersError || metaTitlesError)
    return <ShowError />
  if (!volume || !mutations || !owners || !metaTitles)
    return <ShowInfoMessage message={t('volume_overview.not_found')} />

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '16px',
        width: '100%',
      }}
    >
      <InputData
        volume={volume}
        volumeId={volumeId}
        mutations={mutations}
        owners={owners}
        metaTitles={metaTitles}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          overflow: 'auto',
          // boxShadow: theme.shadows[1],
        }}
      >
        <Typography
          sx={{
            marginBottom: '8px',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          {t('volume_overview.volume_description')}
        </Typography>
        <SpecimensTable volume={volume} />
      </Box>
    </Box>
  )
}

export default VolumeOverview
