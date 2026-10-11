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
import {
  validateTemplateForNextState,
  type TTemplateTransitionIssue,
} from '../../validators/templateTransitionValidator'
import {
  isLockingEnabled,
  applyItemLock,
  unlockWaitingForRescanTasks,
} from './utils/templateItemLocking'
import {
  useDeletePrepareScanTemplateMutation,
  useSynchronizePrepareScanTemplateMutation,
} from '@/api/prepareScanModal'
import {
  useCloseToRescanOrFinalizeMutation,
  useTransitionTemplateStateMutation,
} from '../../mutations'
import {
  getFilteredTemplateItems,
  includesWaitingForRescan,
} from './utils/filters'
import { toast } from 'react-toastify'

type TProps = {
  volumeId?: string
  replacementSources?: TReplacementSource[]
  onDeleted: () => void
  onDiscardChanges: () => Promise<boolean>
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

  const revealFirstInvalidItem = (issues: TTemplateTransitionIssue[]) => {
    const itemIndex = Number(issues[0]?.path.match(/^items\.(\d+)/)?.[1])
    if (
      Number.isInteger(itemIndex) &&
      !getFilteredTemplateItems(items, showOnlyRescans, showOnlyUnlocked).some(
        ({ formIndex }) => formIndex === itemIndex
      )
    ) {
      setShowOnlyRescans(false)
      setShowOnlyUnlocked(false)
    }
  }

  const closeToRescanOrFinalizeMutation = useCloseToRescanOrFinalizeMutation({
    volumeId,
    getValues,
    validateTemplateForNextState: async (targetState) => {
      const isValid = await validateTemplateForNextState({
        trigger,
        clearErrors,
        setError,
        getValues,
        onIssues: revealFirstInvalidItem,
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
    let firstIssue: TTemplateTransitionIssue | undefined
    const isValid = await validateTemplateForNextState({
      trigger,
      clearErrors,
      setError,
      getValues,
      onIssues: (issues) => {
        firstIssue = issues[0]
        revealFirstInvalidItem(issues)
      },
      nextTemplateState: nextState,
    })
    setValidationAttempt((attempt) => attempt + 1)
    if (isValid) {
      toast.success(
        t('prepare_scan_modal.content_template.validation_successful')
      )
    } else {
      const itemIndex = Number(firstIssue?.path.match(/^items\.(\d+)/)?.[1])
      toast.error(
        firstIssue && Number.isInteger(itemIndex)
          ? `${t('prepare_scan_modal.content_template.issue_number_label', {
              number: items[itemIndex]?.specimen.number ?? itemIndex + 1,
            })}: ${firstIssue.message}`
          : t('prepare_scan_modal.content_template.validation_failed')
      )
    }
  }

  const validationPath =
    validationAttempt > 0 ? findFirstErrorPath(errors) : undefined

  const handleCloseToRescanOrFinalize = async () => {
    try {
      if (nextState === TemplateState.WAITING_FOR_RESCAN) {
        setValue('items', getValues('items').map(unlockWaitingForRescanTasks), {
          shouldDirty: true,
        })
      }

      const completed = await closeToRescanOrFinalizeMutation.mutate({
        nextState,
        shouldValidate: shouldValidateTemplateForNextState(nextState),
      })
      if (!completed) {
        toast.error(t('prepare_scan_modal.content_template.validation_failed'))
      }
      return completed
    } catch {
      toast.error(t('common.error_occurred_somewhere'))
      return false
    }
  }

  const handleLockAll = () => {
    const nextItems = getValues('items').map((item) =>
      applyItemLock(item, true)
    )
    setValue('items', nextItems, { shouldDirty: true })
    return true
  }

  const handleUnlockAll = () => {
    const nextItems = getValues('items').map((item) =>
      applyItemLock(item, false)
    )
    setValue('items', nextItems, { shouldDirty: true })
    return true
  }

  const handleDelete = async () => {
    try {
      await deleteTemplateMutation.mutateAsync(undefined, {
        onSuccess: onDeleted,
      })
      return true
    } catch {
      return false
    }
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
      />
    </Box>
  )
}

export default PrepareScanModalContentTemplate
