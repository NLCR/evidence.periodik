import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TemplateState } from '@/components/prepare-scan-modal/schemas/schemas'

export type TTransitionDialogConfig = {
  title: string
  description: string
}

export const useTransitionDialogConfig = (
  nextState: TemplateState
): TTransitionDialogConfig => {
  const { t } = useTranslation()

  return useMemo(() => {
    switch (nextState) {
      case TemplateState.WAITING_FOR_RESCAN:
        return {
          title: t('prepare_scan_modal.transition_confirm.to_waiting.title'),
          description: t(
            'prepare_scan_modal.transition_confirm.to_waiting.description'
          ),
        }
      case TemplateState.FINALIZED:
        return {
          title: t('prepare_scan_modal.transition_confirm.to_finalized.title'),
          description: t(
            'prepare_scan_modal.transition_confirm.to_finalized.description'
          ),
        }
      case TemplateState.LATE_FIXES:
        return {
          title: t('prepare_scan_modal.transition_confirm.to_repairs.title'),
          description: t(
            'prepare_scan_modal.transition_confirm.to_repairs.description'
          ),
        }
      default:
        return {
          title: t('prepare_scan_modal.transition_confirm.default.title'),
          description: t(
            'prepare_scan_modal.transition_confirm.default.description'
          ),
        }
    }
  }, [nextState, t])
}
