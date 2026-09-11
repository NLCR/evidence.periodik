import ScannerIcon from '@mui/icons-material/AdfScanner'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useVolumeManagementStore } from '@/slices/useVolumeManagementStore'
import { type TEdition } from '@/schema/edition'
import { type TUpdatableVolume } from '@/api/volume'
import Box from '@mui/material/Box'
import SaveIcon from '@mui/icons-material/Save'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Button from '@mui/material/Button'
import ModalContainer from '../../../components/ModalContainer'
import Typography from '@mui/material/Typography'
import { validate as uuidValidate } from 'uuid'
import { BACK_META_TITLE_ID } from '@/utils/constants'
import { useInputDataEditabilityContext } from './inputData/InputDataEditabilityContextProvider'
import VolumeStatsModalContent from '../../../components/VolumeStatsModalContent'
import PrepareScanModal from '../../../components/prepare-scan-modal/PrepareScanModal'
import { type FieldsToReset } from '@/utils/duplicateVolume/types'
import DuplicateVolumeModal from '../../../components/DuplicateVolumeModal'
import { useMeQuery } from '@/api/user'
import { hasPermission } from '@/schema/user'

type Props = {
  duplicated: boolean
  volume: TUpdatableVolume | null | undefined
  editions: TEdition[] | undefined
  doDuplicate: (fieldsToReset: FieldsToReset[]) => Promise<void>
  doUpdate: (setVerified?: boolean) => Promise<void>
  doOvergeneratedUpdate: (setVerified?: boolean) => Promise<void>
  doCreate: (setVerified?: boolean) => Promise<void>
  doDelete: () => Promise<void>
}

const SpecimensActions = ({
  duplicated,
  volume,
  editions,
  doDuplicate,
  doUpdate,
  doOvergeneratedUpdate,
  doCreate,
  doDelete,
}: Props) => {
  const { volumeId } = useParams()
  const [searchParams] = useSearchParams()
  const searchParamsBackMetaTitleId = searchParams.get(BACK_META_TITLE_ID)
  const { t, i18n } = useTranslation()
  const { data: me } = useMeQuery()
  const canWriteVolume = hasPermission(me, 'VOLUME_WRITE')
  const canDeleteVolume = hasPermission(me, 'VOLUME_DELETE')
  const canReadTemplate = hasPermission(me, 'TEMPLATE_MANAGE')

  const { locked: isInputDataLocked, disabled } =
    useInputDataEditabilityContext()

  const [volumeStatsModalOpened, setVolumeStatsModalOpened] = useState(false)
  const [duplicationModalOpened, setDuplicationModalOpened] = useState(false)
  const [confirmDeletionModalStage, setConfirmDeletionModalStage] = useState({
    opened: false,
    stage: 1,
  })
  const [prepareScanModalOpened, setPrepareScanModalOpened] = useState(false)

  const setInitialState = useVolumeManagementStore(
    (state) => state.setInitialState
  )
  // const volumeActions = useVolumeManagementStore((state) => state.volumeActions)
  const volumePeriodicityActions = useVolumeManagementStore(
    (state) => state.volumePeriodicityActions
  )
  // const specimensActions = useVolumeManagementStore(
  //   (state) => state.specimensActions
  // )
  const volumeOvergenerated = useVolumeManagementStore(
    (state) => state.periodicityGenerationUsed
  )

  const volumeMetaTitleId = volume?.volume.metaTitleId
  const backMetaTitleId = useMemo(
    () =>
      uuidValidate(searchParamsBackMetaTitleId || '')
        ? searchParamsBackMetaTitleId
        : volumeMetaTitleId,
    [searchParamsBackMetaTitleId, volumeMetaTitleId]
  )

  // useEffect(() => {
  //   if (volume?.volume) {
  //     volumeActions.setVolumeState(volume.volume, false)
  //     specimensActions.setSpecimensState(volume.specimens, false)
  //     volumePeriodicityActions.setPeriodicityGenerationUsed(false)
  //   }
  // }, [specimensActions, volume, volumeActions, volumePeriodicityActions])

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

  const actions = useMemo(() => {
    const actionsArray: {
      icon: ReactNode
      name: string
      color: 'primary' | 'secondary' | 'error'
      onClick: () => void
      disabled: boolean
    }[] = []

    if (volumeId && volumeOvergenerated && canWriteVolume && !disabled) {
      actionsArray.push(
        {
          icon: <ContentCopyIcon />,
          name: t('administration.duplicate_volume'),
          color: 'primary',
          onClick: () => setDuplicationModalOpened(true),
          disabled: !isInputDataLocked,
        },
        {
          icon: <CheckCircleIcon />,
          name: t('administration.verified'),
          color: 'primary',
          onClick: () => doOvergeneratedUpdate(true),
          disabled: !isInputDataLocked,
        },
        {
          icon: <SaveAsIcon />,
          name: t('administration.save'),
          color: 'primary',
          onClick: () => doOvergeneratedUpdate(),
          disabled: !isInputDataLocked,
        }
      )
    }
    if (volumeId && !volumeOvergenerated) {
      if (canReadTemplate) {
        actionsArray.push({
          icon: <ScannerIcon />,
          name: t('prepare_scan_modal.wizard.title'),
          color: 'primary',
          onClick: () => setPrepareScanModalOpened(true),
          disabled: !isInputDataLocked,
        })
      }
      if (canWriteVolume && !disabled) {
        actionsArray.push(
          {
            icon: <ContentCopyIcon />,
            name: t('administration.duplicate_volume'),
            color: 'primary',
            onClick: () => setDuplicationModalOpened(true),
            disabled: !isInputDataLocked,
          },
          {
            icon: <CheckCircleIcon />,
            name: t('administration.verified'),
            color: 'primary',
            onClick: () => doUpdate(true),
            disabled: !isInputDataLocked,
          },
          {
            icon: <SaveAsIcon />,
            name: t('administration.save'),
            color: 'primary',
            onClick: () => doUpdate(),
            disabled: !isInputDataLocked,
          }
        )
      }
    }
    if (volumeId && canDeleteVolume && !disabled) {
      actionsArray.push({
        icon: <DeleteForeverIcon />,
        name: t('administration.delete'),
        color: 'error',
        onClick: () => setConfirmDeletionModalStage({ opened: true, stage: 1 }),
        disabled: !isInputDataLocked,
      })
    }
    if (!volumeId && canWriteVolume && !disabled) {
      actionsArray.push(
        {
          icon: <CheckCircleIcon />,
          name: t('administration.verified'),
          color: 'primary',
          onClick: () => doCreate(true),
          disabled: !isInputDataLocked,
        },
        {
          icon: <SaveIcon />,
          name: t('administration.save'),
          color: 'primary',
          onClick: () => doCreate(),
          disabled: !isInputDataLocked,
        }
      )
    }

    return actionsArray
  }, [
    doCreate,
    canDeleteVolume,
    canReadTemplate,
    canWriteVolume,
    disabled,
    doOvergeneratedUpdate,
    doUpdate,
    isInputDataLocked,
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
          {backMetaTitleId?.length ? (
            <Button
              component={Link}
              variant="outlined"
              to={`/${i18n.resolvedLanguage}/${t('urls.specimens_overview')}/${backMetaTitleId}`}
            >
              {t('volume_overview.back_to_specimens_overview')}
            </Button>
          ) : null}
          {volumeId ? (
            <Button
              variant="outlined"
              disabled={!isInputDataLocked}
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
          {actions.map((action) => (
            <Button
              disabled={action.disabled}
              variant="contained"
              color={action.color}
              key={action.name}
              startIcon={action.icon}
              onClick={action.onClick}
            >
              {action.name}
            </Button>
          ))}
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
        autoWidth
        minWidth="30rem"
        header={t('specimens_overview.volume_overview_modal_link')}
        opened={volumeStatsModalOpened}
        onClose={() => setVolumeStatsModalOpened(false)}
        closeButton={{ callback: () => setVolumeStatsModalOpened(false) }}
      >
        <VolumeStatsModalContent volumeId={volumeId} />
      </ModalContainer>

      {canReadTemplate ? (
        <PrepareScanModal
          volumeId={volumeId ?? ''}
          isOpen={prepareScanModalOpened}
          setIsOpen={setPrepareScanModalOpened}
        />
      ) : null}

      <DuplicateVolumeModal
        doDuplicate={doDuplicate}
        isOpen={duplicationModalOpened}
        setIsOpen={setDuplicationModalOpened}
      />
    </>
  )
}

export default SpecimensActions
