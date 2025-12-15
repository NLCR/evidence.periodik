import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import { FC, useEffect } from 'react'
import { useManagedVolumeDetailQuery } from '../../api/volume'
import Loader from '../../components/Loader'
import ShowError from '../../components/ShowError'
import ShowInfoMessage from '../../components/ShowInfoMessage'
import { useMutationListQuery } from '../../api/mutation'
import { useOwnerListQuery } from '../../api/owner'
import { useEditionListQuery } from '../../api/edition'
import { useMeQuery } from '../../api/user'
import SpecimensTable from './components/SpecimensTable'
import { useMetaTitleListQuery } from '../../api/metaTitle'
import { useVolumeManagementStore } from '../../slices/useVolumeManagementStore'
import InputData from './components/inputData/InputData'
import { InputDataEditabilityContextProvider } from './components/inputData/InputDataEditabilityContextProvider'
import SpecimensActions from './components/SpecimensActions'
import useVolumeManagementActions from '../../hooks/useVolumeManagementActions'
import { useGridApiRef } from '@mui/x-data-grid-pro'

type TVolumeManagementProps = {
  duplicated?: boolean
}

const VolumeManagement: FC<TVolumeManagementProps> = ({
  duplicated = false,
}) => {
  const { volumeId } = useParams()
  const { data: me, isLoading: meLoading, isError: meError } = useMeQuery()
  const { t } = useTranslation()

  const apiRef = useGridApiRef()

  const setInitialState = useVolumeManagementStore(
    (state) => state.setInitialState
  )
  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )

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
  } = useManagedVolumeDetailQuery(volumeId)
  const {
    data: editions,
    isLoading: editionsLoading,
    isError: editionsError,
  } = useEditionListQuery()
  const {
    data: metaTitles,
    isLoading: metaTitlesLoading,
    isError: metaTitlesError,
  } = useMetaTitleListQuery()

  useEffect(() => {
    if (!volumeId && !duplicated) {
      setInitialState()
      if (editions) {
        volumePeriodicityActions.setDefaultPeriodicityEdition(editions)
      }
    }
  }, [
    editions,
    volumeId,
    volumePeriodicityActions,
    setInitialState,
    duplicated,
  ])

  const {
    doDuplicate,
    doUpdate,
    doOvergeneratedUpdate,
    doCreate,
    doDelete,
    pendingActions,
  } = useVolumeManagementActions(apiRef, editions || [])

  if (
    volumeLoading ||
    editionsLoading ||
    mutationsLoading ||
    ownersLoading ||
    metaTitlesLoading ||
    meLoading
  )
    return <Loader />
  if (
    volumeError ||
    editionsError ||
    mutationsError ||
    ownersError ||
    metaTitlesError ||
    meError
  )
    return <ShowError />
  if (
    (!volume && volumeId?.length) ||
    !editions ||
    !mutations ||
    !owners ||
    !metaTitles
  ) {
    return <ShowInfoMessage message={t('volume_overview.not_found')} />
  }

  if (!me) {
    return <ShowInfoMessage message={t('volume_overview.account_required')} />
  }

  return (
    <InputDataEditabilityContextProvider
      me={me}
      volume={volume}
      volumeId={volumeId}
      locked={!!volumeId}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          width: '100%',
        }}
      >
        {pendingActions ? (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Loader />
          </Box>
        ) : null}
        <InputData
          me={me}
          volume={volume?.volume}
          isVolumeLoading={
            meLoading ||
            ownersLoading ||
            editionsLoading ||
            mutationsLoading ||
            metaTitlesLoading ||
            volumeLoading
          }
          mutations={mutations}
          owners={owners}
          metaTitles={metaTitles}
          editions={editions}
          duplicated={duplicated}
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
            // ...(locked ? {} : {}),
            // boxShadow: theme.shadows[1],
          }}
        >
          <SpecimensTable
            apiRef={apiRef}
            mutations={mutations}
            editions={editions}
          />
          <SpecimensActions
            duplicated={duplicated}
            volume={volume}
            editions={editions}
            doDuplicate={doDuplicate}
            doUpdate={doUpdate}
            doOvergeneratedUpdate={doOvergeneratedUpdate}
            doCreate={doCreate}
            doDelete={doDelete}
          />
        </Box>
      </Box>
    </InputDataEditabilityContextProvider>
  )
}

// VolumeManagement.whyDidYouRender = true

export default VolumeManagement
