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
import { useTranslation } from 'react-i18next'
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
import { toast } from 'react-toastify'

type TProps = {
  volumeId?: string
  replacementSources?: TReplacementSource[]
  onDeleted: () => void
  onDiscardChanges: () => Promise<void>
  hasUnsavedChanges: boolean
}

const findFirstErrorPath = (value: unknown, path = ''): string | undefined => {
  if (!value || typeof value !== 'object') return undefined
  if ('message' in value && typeof value.message === 'string') return path

  for (const [key, child] of Object.entries(value)) {
    if (key === 'ref' || key === 'types' || key === 'message') continue
    const childPath = path ? `${path}.${key}` : key
    const errorPath = findFirstErrorPath(child, childPath)
    if (errorPath) return errorPath
  }

  return undefined
}

const PrepareScanModalContentTemplate: FC<TProps> = ({
  volumeId = undefined,
  replacementSources = [],
  onDeleted,
  onDiscardChanges,
  hasUnsavedChanges,
}) => {
  const { t } = useTranslation()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showOnlyRescans, setShowOnlyRescans] = useState(false)
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false)
  const [validationAttempt, setValidationAttempt] = useState(0)
  const {
    control,
    getValues,
    setValue,
    trigger,
    clearErrors,
    setError,
    formState: { errors },
  } = useFormContext<TTemplate>()

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
    validateTemplateForNextState: async (targetState) => {
      const isValid = await validateTemplateForNextState({
        trigger,
        clearErrors,
        setError,
        getValues,
        nextTemplateState: targetState as
          | TemplateState.WAITING_FOR_RESCAN
          | TemplateState.FINALIZED,
      })
      setValidationAttempt((attempt) => attempt + 1)
      return isValid
    },
  })

  const handleValidate = async () => {
    if (!shouldValidateTemplateForNextState(nextState)) return
    const isValid = await validateTemplateForNextState({
      trigger,
      clearErrors,
      setError,
      getValues,
      nextTemplateState: nextState,
    })
    setValidationAttempt((attempt) => attempt + 1)
    if (isValid) {
      toast.success(
        t('prepare_scan_modal.content_template.validation_successful')
      )
    } else {
      toast.error(t('prepare_scan_modal.content_template.validation_failed'))
    }
  }

  const validationPath =
    validationAttempt > 0 ? findFirstErrorPath(errors) : undefined

  const handleCloseToRescanOrFinalize = async () => {
    try {
      const completed = await closeToRescanOrFinalizeMutation.mutate({
        nextState,
        shouldValidate: shouldValidateTemplateForNextState(nextState),
      })
      if (!completed) {
        toast.error(t('prepare_scan_modal.content_template.validation_failed'))
      }
    } catch {
      toast.error(t('common.error_occurred_somewhere'))
    }
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

  const handleDelete = () =>
    deleteTemplateMutation.mutate(undefined, { onSuccess: onDeleted })

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
              synchronizeVolumeMutation.mutate({
                version: getValues('version')!,
              })
            }
            onCloseToRescanOrFinalize={handleCloseToRescanOrFinalize}
            onLockAll={handleLockAll}
            onUnlockAll={handleUnlockAll}
            onDeleteTemplate={handleDelete}
            onDiscardChanges={onDiscardChanges}
            hasUnsavedChanges={hasUnsavedChanges}
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
          validationPath={validationPath}
          validationAttempt={validationAttempt}
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
