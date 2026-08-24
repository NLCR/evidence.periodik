import Box from '@mui/material/Box'
import { type FC, useMemo, useState } from 'react'
import {
  type TReplacementSource,
  type TTemplate,
  TemplateState,
  getNextTemplateState,
  shouldValidateTemplateForNextState,
} from '@/components/prepare-scan-modal/schemas/schemas'
import PrepareScanTemplatePreviewDialog from './preview/PrepareScanTemplatePreviewDialog'
import TemplatePreviewHeader from './preview/TemplatePreviewHeader'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'
import PrepareScanTemplateFilters from '@/components/prepare-scan-modal/steps/template/components/PrepareScanTemplateFilters'
import PrepareScanTemplateActionBar from '@/components/prepare-scan-modal/steps/template/components/PrepareScanTemplateActionBar'
import { useSubmitButtonLabel } from './hooks/useSubmitButtonLabel'
import { useTransitionDialogConfig } from './hooks/useTransitionDialogConfig'
import { useFormContext, useWatch } from 'react-hook-form'
import { validateTemplateForNextState } from '../../validators/templateTransitionValidator'
import {
  hasWaitingReplacement,
  isLockingEnabled,
  applyItemLock,
} from './utils/templateItemLocking'
import {
  useDeletePrepareScanTemplateMutation,
  useSynchronizePrepareScanTemplateMutation,
} from '@/api/prepareScanModal'
import {
  useCloseToRescanOrFinalizeMutation,
  useTransitionTemplateStateMutation,
} from '../../mutations'
import { includesWaitingForRescan } from './utils/filters'

type TProps = {
  volumeId?: string
  replacementSources?: TReplacementSource[]
}

const PrepareScanModalContentTemplate: FC<TProps> = ({
  volumeId = undefined,
  replacementSources = [],
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showOnlyRescans, setShowOnlyRescans] = useState(false)
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false)
  const { control, getValues, setValue, trigger, clearErrors, setError } =
    useFormContext<TTemplate>()

  const transitionTemplateStateMutation =
    useTransitionTemplateStateMutation(volumeId)
  const synchronizeVolumeMutation =
    useSynchronizePrepareScanTemplateMutation(volumeId)
  const deleteTemplateMutation = useDeletePrepareScanTemplateMutation(volumeId)

  const primaryVolume = useWatch({ control, name: 'primaryVolume' })
  const items = useWatch({ control, name: 'items' })
  const watchedState = useWatch({ control, name: 'state' })

  const hasWaitingForRescan = useMemo(
    () => includesWaitingForRescan(items),
    [items]
  )

  const nextState = getNextTemplateState(watchedState, hasWaitingForRescan)

  const closeToRescanOrFinalizeMutation = useCloseToRescanOrFinalizeMutation({
    volumeId,
    getValues,
    setValue,
    validateTemplateForNextState: (targetState) =>
      validateTemplateForNextState({
        trigger,
        clearErrors,
        setError,
        getValues,
        nextTemplateState: targetState as
          | TemplateState.WAITING_FOR_RESCAN
          | TemplateState.FINALIZED,
      }),
  })

  const handleValidate = async () => {
    if (!shouldValidateTemplateForNextState(nextState)) return
    await validateTemplateForNextState({
      trigger,
      clearErrors,
      setError,
      getValues,
      nextTemplateState: nextState,
    })
  }

  const handleCloseToRescanOrFinalize = async () => {
    await closeToRescanOrFinalizeMutation.mutate({
      nextState,
      shouldValidate: shouldValidateTemplateForNextState(nextState),
    })
  }

  const handleLockAll = () => {
    const nextItems = getValues('items').map((item) =>
      hasWaitingReplacement(item) ? item : applyItemLock(item, true)
    )
    setValue('items', nextItems, { shouldDirty: true })
  }

  const handleUnlockAll = () => {
    const nextItems = getValues('items').map((item) =>
      applyItemLock(item, false)
    )
    setValue('items', nextItems, { shouldDirty: true })
  }

  const canSyncFromVolume =
    watchedState === TemplateState.WAITING_FOR_RESCAN ||
    watchedState === TemplateState.LATE_FIXES

  const canManageLocks = isLockingEnabled(watchedState)

  const isMutating =
    transitionTemplateStateMutation.isPending ||
    synchronizeVolumeMutation.isPending ||
    deleteTemplateMutation.isPending

  const submitButtonLabel = useSubmitButtonLabel(nextState)

  const transitionDialogConfig = useTransitionDialogConfig(nextState)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box sx={{ marginBottom: '10px' }}>
        <TemplatePreviewHeader
          primaryVolume={primaryVolume}
          items={items}
          displayCurrentState
          currentState={watchedState}
        />

        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          gap={1}
          marginTop={0.25}
        >
          <PrepareScanTemplateFilters
            showOnlyRescans={showOnlyRescans}
            showOnlyUnlocked={showOnlyUnlocked}
            onShowOnlyRescansChange={setShowOnlyRescans}
            onShowOnlyUnlockedChange={setShowOnlyUnlocked}
          />

          <PrepareScanTemplateActionBar
            watchedState={watchedState}
            canSyncFromVolume={canSyncFromVolume}
            canManageLocks={canManageLocks}
            isMutating={isMutating}
            submitButtonLabel={submitButtonLabel}
            transitionDialogConfig={transitionDialogConfig}
            onOpenPreview={() => setIsPreviewOpen(true)}
            onValidate={handleValidate}
            onSyncFromVolume={() =>
              synchronizeVolumeMutation.mutate({ state: watchedState })
            }
            onCloseToRescanOrFinalize={handleCloseToRescanOrFinalize}
            onLockAll={handleLockAll}
            onUnlockAll={handleUnlockAll}
            onDeleteTemplate={deleteTemplateMutation.mutate}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedSpecimenList
          items={items}
          viewOnly={false}
          replacementSourceCandidates={replacementSources}
          showOnlyRescans={showOnlyRescans}
          showOnlyUnlocked={showOnlyUnlocked}
          disabled={watchedState === TemplateState.FINALIZED}
        />
      </Box>

      <PrepareScanTemplatePreviewDialog
        opened={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        primaryVolume={primaryVolume}
        barCode={primaryVolume?.barCode}
        items={items}
        showOnlyRescans={showOnlyRescans}
        showOnlyUnlocked={showOnlyUnlocked}
      />
    </Box>
  )
}

export default PrepareScanModalContentTemplate
