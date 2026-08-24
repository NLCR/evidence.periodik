import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import ConfirmDialog from '@/pages/specimensOverview/components/dialogs/ConfirmDialog'
import { TemplateState } from '@/components/prepare-scan-modal/schemas/templateStateSchema'
import ResponsiveActionButton from '@/components/prepare-scan-modal/steps/template/components/ResponsiveActionButton'
import { type TTransitionDialogConfig } from '@/components/prepare-scan-modal/steps/template/hooks/useTransitionDialogConfig'

type TProps = {
  watchedState: TemplateState
  canSyncFromVolume: boolean
  canManageLocks: boolean
  isMutating: boolean
  submitButtonLabel: string
  transitionDialogConfig: TTransitionDialogConfig
  onOpenPreview: () => void
  onValidate: () => void
  onSyncFromVolume: () => void
  onCloseToRescanOrFinalize: () => void
  onLockAll: () => void
  onUnlockAll: () => void
  onDeleteTemplate: () => void
}

const PrepareScanTemplateActionBar: FC<TProps> = ({
  watchedState,
  canSyncFromVolume,
  canManageLocks,
  isMutating,
  submitButtonLabel,
  transitionDialogConfig,
  onOpenPreview,
  onValidate,
  onSyncFromVolume,
  onCloseToRescanOrFinalize,
  onLockAll,
  onUnlockAll,
  onDeleteTemplate,
}) => {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={1}>
      <ResponsiveActionButton
        variant="outlined"
        onClick={onOpenPreview}
        icon={<VisibilityIcon sx={{ translate: { xs: '-2px 0', sm: '' } }} />}
        label={t('prepare_scan_modal.content_template.show_preview_button')}
      />

      {watchedState !== TemplateState.FINALIZED && (
        <ResponsiveActionButton
          variant="outlined"
          onClick={onValidate}
          icon={<CheckIcon sx={{ translate: { xs: '-2px 0', sm: '' } }} />}
          label={t('prepare_scan_modal.content_template.validate_button')}
        />
      )}

      {canSyncFromVolume && (
        <ResponsiveActionButton
          variant="outlined"
          onClick={onSyncFromVolume}
          disabled={isMutating}
          icon={<SyncRoundedIcon />}
          label={t(
            'prepare_scan_modal.content_template.sync_from_volume_button'
          )}
        />
      )}

      <ConfirmDialog
        TriggerButton={
          <Button
            variant="contained"
            onClick={onCloseToRescanOrFinalize}
            disabled={isMutating}
          >
            {submitButtonLabel}
          </Button>
        }
        title={transitionDialogConfig.title}
        description={
          <Typography>{transitionDialogConfig.description}</Typography>
        }
        confirmLabel={t('common.confirm')}
        refuseLabel={t('common.cancel')}
        onConfirm={onCloseToRescanOrFinalize}
      />

      <ConfirmDialog
        TriggerButton={
          <Button
            variant="outlined"
            sx={{ minWidth: 0 }}
            disabled={!canManageLocks}
          >
            <LockIcon />
          </Button>
        }
        title={t('prepare_scan_modal.content_template.lock_all_confirm_title')}
        description={t(
          'prepare_scan_modal.content_template.lock_all_confirm_description'
        )}
        confirmLabel={t('common.confirm')}
        refuseLabel={t('common.cancel')}
        onConfirm={onLockAll}
      />

      <ConfirmDialog
        TriggerButton={
          <Button
            variant="outlined"
            sx={{ minWidth: 0 }}
            disabled={!canManageLocks}
          >
            <LockOpenIcon />
          </Button>
        }
        title={t(
          'prepare_scan_modal.content_template.unlock_all_confirm_title'
        )}
        description={t(
          'prepare_scan_modal.content_template.unlock_all_confirm_description'
        )}
        confirmLabel={t('common.confirm')}
        refuseLabel={t('common.cancel')}
        onConfirm={onUnlockAll}
      />

      <ConfirmDialog
        TriggerButton={
          <Button variant="outlined" sx={{ minWidth: 0 }}>
            <DeleteIcon />
          </Button>
        }
        title={t(
          'prepare_scan_modal.content_template.delete_template_confirm_title'
        )}
        description={t(
          'prepare_scan_modal.content_template.delete_template_confirm_description'
        )}
        onConfirm={onDeleteTemplate}
      />
    </Stack>
  )
}

export default PrepareScanTemplateActionBar
