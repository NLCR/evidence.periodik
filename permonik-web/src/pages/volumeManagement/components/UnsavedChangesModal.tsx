import { useVolumeManagementStore } from '../../../slices/useVolumeManagementStore'
import {
  type BlockerFunction,
  useBeforeUnload,
  useBlocker,
} from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import ModalContainer from '../../../components/ModalContainer'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

const UnsavedChangesModal = () => {
  const { t } = useTranslation()
  const stateHasUnsavedData = useVolumeManagementStore(
    useShallow((state) => state.stateHasUnsavedData)
  )

  useBeforeUnload((event) => {
    if (stateHasUnsavedData) {
      event.preventDefault()
      event.returnValue = t('volume_overview.unsaved_changes')
    }
  })

  const shouldBlockNavigationChange = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      stateHasUnsavedData && currentLocation.pathname !== nextLocation.pathname,
    [stateHasUnsavedData]
  )

  const blocker = useBlocker(shouldBlockNavigationChange)

  useEffect(() => {
    if (blocker.state === 'blocked' && !stateHasUnsavedData) {
      blocker.reset()
    }
  }, [blocker, stateHasUnsavedData])

  return (
    <ModalContainer
      header={t('volume_overview.unsaved_changes')}
      opened={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      closeButton={{
        callback: () => blocker.reset?.(),
        text: t('common.no'),
      }}
      acceptButton={{
        callback: () => blocker.proceed?.(),
        text: t('common.yes'),
      }}
      style="fitted"
    >
      <Typography
        sx={{
          marginBottom: '16px',
        }}
      >
        {t('volume_overview.unsaved_changes_text')}
      </Typography>
    </ModalContainer>
  )
}

// UnsavedChangesModal.whyDidYouRender = true

export default UnsavedChangesModal
