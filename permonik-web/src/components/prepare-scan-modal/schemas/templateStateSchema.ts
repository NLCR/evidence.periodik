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
