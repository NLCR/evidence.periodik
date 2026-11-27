import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TemplateState } from '@/components/prepare-scan-modal/schemas/schemas'

export const useSubmitButtonLabel = (nextState: TemplateState): string => {
  const { t } = useTranslation()

  return useMemo(() => {
    if (nextState === TemplateState.WAITING_FOR_RESCAN) {
      return t('prepare_scan_modal.content_template.close_to_rescan_button')
    }

    if (nextState === TemplateState.LATE_FIXES) {
      return t('prepare_scan_modal.content_template.switch_to_repairs_button')
    }

    return t('prepare_scan_modal.content_template.finalize_button')
  }, [nextState, t])
}
