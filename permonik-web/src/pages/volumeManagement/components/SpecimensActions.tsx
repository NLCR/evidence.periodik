import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useVolumeManagementStore } from '../../../slices/useVolumeManagementStore'
import { TMe } from '../../../schema/user'
import { TEdition } from '../../../schema/edition'
import { TUpdatableVolume } from '../../../api/volume'
import Box from '@mui/material/Box'
import SaveIcon from '@mui/icons-material/Save'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Button from '@mui/material/Button'
import ModalContainer from '../../../components/ModalContainer'
import Typography from '@mui/material/Typography'
import VolumeStatsModalContent from '../../../components/VolumeStatsModalContent'
import UnsavedChangesModal from './UnsavedChangesModal'
import { validate as uuidValidate } from 'uuid'
import { BACK_META_TITLE_ID } from '../../../utils/constants'

type Props = {
  duplicated: boolean
  me: TMe | undefined
  volume: TUpdatableVolume | null | undefined
  editions: TEdition[] | undefined
  doDuplicate: () => Promise<void>
  doUpdate: (setVerified?: boolean) => Promise<void>
  doOvergeneratedUpdate: (setVerified?: boolean) => Promise<void>
  doCreate: (setVerified?: boolean) => Promise<void>
  doDelete: () => Promise<void>
}

const SpecimensActions = ({
  duplicated,
  me,
  volume,
  editions,
  doDuplicate,
  doUpdate,
  doOvergeneratedUpdate,
  doCreate,
  doDelete,
}: Props) => {
  const { volumeId } = useParams()

  const { t, i18n } = useTranslation()

  const [searchParams] = useSearchParams()

  const [volumeStatsModalOpened, setVolumeStatsModalOpened] = useState(false)
  const [confirmDeletionModalStage, setConfirmDeletionModalStage] = useState({
    opened: false,
    stage: 1,
  })

  const setInitialState = useVolumeManagementStore(
    (state) => state.setInitialState
  )
  const volumeActions = useVolumeManagementStore((state) => state.volumeActions)
  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const volumeOvergenerated = useVolumeManagementStore(
    (state) => state.periodicityGenerationUsed
  )

  const backMetaTitle = useMemo(
    () =>
      uuidValidate(searchParams.get(BACK_META_TITLE_ID) || '')
        ? searchParams.get(BACK_META_TITLE_ID)
        : volume?.volume.metaTitleId,
    [searchParams, volume?.volume.metaTitleId]
  )

  useEffect(() => {
    if (volume?.volume) {
      volumeActions.setVolumeState(volume.volume, false)
      specimensActions.setSpecimensState(volume.specimens, false)
      volumePeriodicityActions.setPeriodicityGenerationUsed(false)
    }
  }, [specimensActions, volume, volumeActions, volumePeriodicityActions])

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

  const handleDeletion = () => {
    doDelete()
  }

  const canEdit = useMemo(
    () =>
      me?.owners?.some((o) => o === volume?.volume?.ownerId) ||
      !volumeId?.length ||
      me?.role === 'super_admin',
    [me, volume?.volume, volumeId?.length]
  )

  const actions = useMemo(() => {
    const actionsArray: {
      icon: ReactNode
      name: string
      color: 'primary' | 'secondary' | 'error'
      onClick: () => void
    }[] = []

    if (volumeId && volumeOvergenerated) {
      actionsArray.push(
        {
          icon: <ContentCopyIcon />,
          name: t('administration.duplicate_volume'),
          color: 'primary',
          onClick: () => doDuplicate(),
        },
        {
          icon: <CheckCircleIcon />,
          name: t('administration.verified'),
          color: 'primary',
          onClick: () => doOvergeneratedUpdate(true),
        },
        {
          icon: <SaveAsIcon />,
          name: t('administration.save'),
          color: 'primary',
          onClick: () => doOvergeneratedUpdate(),
        }
      )
    }
    if (volumeId && !volumeOvergenerated) {
      actionsArray.push(
        {
          icon: <ContentCopyIcon />,
          name: t('administration.duplicate_volume'),
          color: 'primary',
          onClick: () => doDuplicate(),
        },
        {
          icon: <CheckCircleIcon />,
          name: t('administration.verified'),
          color: 'primary',
          onClick: () => doUpdate(true),
        },
        {
          icon: <SaveAsIcon />,
          name: t('administration.save'),
          color: 'primary',
          onClick: () => doUpdate(),
        }
      )
    }
    if (volumeId) {
      actionsArray.push({
        icon: <DeleteForeverIcon />,
        name: t('administration.delete'),
        color: 'error',
        onClick: () => setConfirmDeletionModalStage({ opened: true, stage: 1 }),
      })
    }
    if (!volumeId) {
      actionsArray.push(
        {
          icon: <CheckCircleIcon />,
          name: t('administration.verified'),
          color: 'primary',
          onClick: () => doCreate(true),
        },
        {
          icon: <SaveIcon />,
          name: t('administration.save'),
          color: 'primary',
          onClick: () => doCreate(),
        }
      )
    }

    return actionsArray
  }, [
    doDuplicate,
    doCreate,
    doOvergeneratedUpdate,
    doUpdate,
    t,
    volumeId,
    volumeOvergenerated,
  ])

  return (
    <>
      <Box
        sx={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {backMetaTitle?.length ? (
            <Button
              component={Link}
              variant="outlined"
              to={`/${i18n.resolvedLanguage}/${t('urls.specimens_overview')}/${backMetaTitle}`}
            >
              {t('volume_overview.back_to_specimens_overview')}
            </Button>
          ) : null}
          {volumeId ? (
            <Button
              variant="outlined"
              onClick={() => setVolumeStatsModalOpened(true)}
            >
              {t('specimens_overview.volume_overview_modal_link')}
            </Button>
          ) : null}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {canEdit ? (
            <>
              {actions.map((action) => (
                <Button
                  variant="contained"
                  color={action.color}
                  key={action.name}
                  startIcon={action.icon}
                  onClick={action.onClick}
                >
                  {action.name}
                </Button>
              ))}
            </>
          ) : null}
        </Box>
      </Box>
      <ModalContainer
        onClose={() =>
          setConfirmDeletionModalStage((prevState) => ({
            ...prevState,
            opened: false,
          }))
        }
        header={
          confirmDeletionModalStage.stage === 1
            ? t('volume_overview.delete_volume_text')
            : t('volume_overview.delete_volume_text2')
        }
        opened={!!volumeId?.length && confirmDeletionModalStage.opened}
        acceptButton={{
          callback: () => {
            if (confirmDeletionModalStage.stage === 1) {
              setConfirmDeletionModalStage((prevState) => ({
                ...prevState,
                opened: false,
              }))
            }
            if (confirmDeletionModalStage.stage === 2) {
              setConfirmDeletionModalStage((prevState) => ({
                ...prevState,
                opened: false,
              }))
            }
          },
          text:
            confirmDeletionModalStage.stage === 1
              ? t('common.no')
              : t('common.yes'),
        }}
        closeButton={{
          callback: () => {
            if (confirmDeletionModalStage.stage === 1) {
              setConfirmDeletionModalStage((prevState) => ({
                ...prevState,
                stage: 2,
              }))
            }
            if (confirmDeletionModalStage.stage === 2) {
              setConfirmDeletionModalStage((prevState) => ({
                ...prevState,
                opened: false,
              }))
              handleDeletion()
            }
          },
          text:
            confirmDeletionModalStage.stage === 1
              ? t('common.yes')
              : t('common.no'),
        }}
        style="fitted"
        switchButtons={confirmDeletionModalStage.stage === 2}
      >
        <Typography
          sx={{
            marginBottom: '16px',
          }}
        >
          {confirmDeletionModalStage.stage === 1
            ? t('volume_overview.delete_volume_text')
            : t('volume_overview.delete_volume_text2')}
        </Typography>
      </ModalContainer>
      <ModalContainer
        header={t('specimens_overview.volume_overview_modal_link')}
        opened={volumeStatsModalOpened}
        onClose={() => setVolumeStatsModalOpened(false)}
        closeButton={{ callback: () => setVolumeStatsModalOpened(false) }}
      >
        <VolumeStatsModalContent volumeId={volumeId} />
      </ModalContainer>
      <UnsavedChangesModal />
    </>
  )
}

export default SpecimensActions
