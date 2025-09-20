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
import { useFormContext } from 'react-hook-form'

const UnsavedChangesModal = () => {
  const { t } = useTranslation()
  const stateHasUnsavedData = useVolumeManagementStore(
    useShallow((state) => state.stateHasUnsavedData)
  )

  const {
    formState: { isDirty },
  } = useFormContext()

  const hasUnsavedData = stateHasUnsavedData || isDirty

  useBeforeUnload((event) => {
    if (hasUnsavedData) {
      event.preventDefault()
      event.returnValue = t('volume_overview.unsaved_changes')
    }
  })

  const shouldBlockNavigationChange = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedData && currentLocation.pathname !== nextLocation.pathname,
    [hasUnsavedData]
  )

  const blocker = useBlocker(shouldBlockNavigationChange)

  useEffect(() => {
    if (blocker.state === 'blocked' && !hasUnsavedData) {
      blocker.reset()
    }
  }, [blocker, hasUnsavedData])

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
