import { useFormContext } from 'react-hook-form'
import type { UseFormGetValues } from 'react-hook-form'
import { useTransitionPrepareScanTemplateMutation } from '@/api/prepareScanModal'
import type { TTemplate, TemplateState } from './schemas/schemas'

type TTransitionTemplateStatePayload = {
  template: TTemplate
  nextState: TemplateState
}

export const useTransitionTemplateStateMutation = (volumeId?: string) => {
  const transitionMutation = useTransitionPrepareScanTemplateMutation(volumeId)

  return {
    mutate: ({ template, nextState }: TTransitionTemplateStatePayload) =>
      transitionMutation.mutateAsync({ template, targetState: nextState }),
    isPending: transitionMutation.isPending,
    error: transitionMutation.error,
  }
}

type TUseCloseToRescanOrFinalizeMutationArgs = {
  volumeId?: string
  getValues: UseFormGetValues<TTemplate>
  validateTemplateForNextState: (
    nextTemplateState: TemplateState
  ) => Promise<boolean>
}

export const useCloseToRescanOrFinalizeMutation = (
  args: TUseCloseToRescanOrFinalizeMutationArgs
) => {
  const { reset } = useFormContext<TTemplate>()
  const transitionTemplateStateMutation = useTransitionTemplateStateMutation(
    args.volumeId
  )

  const mutate = async ({
    nextState,
    shouldValidate,
  }: {
    nextState: TemplateState
    shouldValidate: boolean
  }): Promise<boolean> => {
    const isValid = shouldValidate
      ? await args.validateTemplateForNextState(nextState)
      : true

    if (!isValid) return false

    const payload = args.getValues()

    const template = await transitionTemplateStateMutation.mutate({
      template: payload,
      nextState,
    })
    reset(template)
    return true
  }

  return {
    mutate,
    isPending: transitionTemplateStateMutation.isPending,
    error: transitionTemplateStateMutation.error,
  }
}
