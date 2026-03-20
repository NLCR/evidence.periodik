import i18next from '../../../i18next'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'

export enum TemplateState {
  CREATED = 'CREATED',
  WAITING_FOR_RESCAN = 'WAITING_FOR_RESCAN',
  FINALIZED = 'FINALIZED',
}

export const templateStateTransitions: Record<TemplateState, TemplateState[]> =
  {
    [TemplateState.CREATED]: [
      TemplateState.WAITING_FOR_RESCAN,
      TemplateState.FINALIZED,
    ],
    [TemplateState.WAITING_FOR_RESCAN]: [TemplateState.FINALIZED],
    [TemplateState.FINALIZED]: [],
  }

export const canTransitionTemplateState = (
  from: TemplateState,
  to: TemplateState
) => templateStateTransitions[from].includes(to)

export const getTemplateStateLabel = (state: TemplateState) => {
  switch (state) {
    case TemplateState.CREATED:
      return i18next.t('prepare_scan_modal.template_state.created')
    case TemplateState.WAITING_FOR_RESCAN:
      return i18next.t('prepare_scan_modal.template_state.waiting_for_rescan')
    case TemplateState.FINALIZED:
      return i18next.t('prepare_scan_modal.template_state.finalized')
    default:
      return state
  }
}

export const getTemplateStateIcon = (state: TemplateState) => {
  switch (state) {
    case TemplateState.CREATED:
      return EditRoundedIcon
    case TemplateState.WAITING_FOR_RESCAN:
      return AutorenewRoundedIcon
    case TemplateState.FINALIZED:
      return CheckCircleRoundedIcon
    default:
      return CheckCircleRoundedIcon
  }
}
