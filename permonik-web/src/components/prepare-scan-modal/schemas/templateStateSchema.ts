import i18next from '../../../i18next'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'

export enum TemplateState {
  CREATED = 'CREATED',
  WAITING_FOR_RESCAN = 'WAITING_FOR_RESCAN',
  FINALIZED = 'FINALIZED',
  LATE_FIXES = 'LATE_FIXES',
}

export const templateStateTransitions: Record<TemplateState, TemplateState[]> =
  {
    [TemplateState.CREATED]: [
      TemplateState.WAITING_FOR_RESCAN,
      TemplateState.FINALIZED,
    ],
    [TemplateState.WAITING_FOR_RESCAN]: [TemplateState.FINALIZED],
    [TemplateState.FINALIZED]: [TemplateState.LATE_FIXES],
    [TemplateState.LATE_FIXES]: [TemplateState.FINALIZED],
  }

export const canTransitionTemplateState = (
  from: TemplateState,
  to: TemplateState
) => templateStateTransitions[from].includes(to)

export const getNextTemplateState = (
  currentState: TemplateState,
  hasWaitingForRescan: boolean
): TemplateState => {
  if (currentState === TemplateState.CREATED) {
    return hasWaitingForRescan
      ? TemplateState.WAITING_FOR_RESCAN
      : TemplateState.FINALIZED
  }

  return templateStateTransitions[currentState][0] ?? TemplateState.FINALIZED
}

export const shouldValidateTemplateForNextState = (
  nextState: TemplateState
): nextState is TemplateState.WAITING_FOR_RESCAN | TemplateState.FINALIZED =>
  nextState !== TemplateState.LATE_FIXES

export const getTemplateStateLabel = (state: TemplateState) => {
  switch (state) {
    case TemplateState.CREATED:
      return i18next.t('prepare_scan_modal.template_state.created')
    case TemplateState.WAITING_FOR_RESCAN:
      return i18next.t('prepare_scan_modal.template_state.waiting_for_rescan')
    case TemplateState.FINALIZED:
      return i18next.t('prepare_scan_modal.template_state.finalized')
    case TemplateState.LATE_FIXES:
      return i18next.t('prepare_scan_modal.template_state.late_fixes')
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
    case TemplateState.LATE_FIXES:
      return BuildRoundedIcon
    default:
      return CheckCircleRoundedIcon
  }
}
