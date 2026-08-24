import { useMutation } from '@tanstack/react-query'
import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form'
import {
  useSavePrepareScanTemplateMutation,
  useUpdatePrepareScanTemplateStateMutation,
} from '@/api/prepareScanModal'
import { type TTemplate, TemplateState } from './schemas/schemas'
import { applyItemLock } from '@/components/prepare-scan-modal/steps/template/utils/templateItemLocking'

type TTransitionTemplateStatePayload = {
  template: TTemplate
  nextState: TemplateState
}

export const useTransitionTemplateStateMutation = (volumeId?: string) => {
  const saveTemplateMutation = useSavePrepareScanTemplateMutation(volumeId)
  const updateTemplateStateMutation =
    useUpdatePrepareScanTemplateStateMutation(volumeId)

  const transitionMutation = useMutation({
    mutationFn: async ({
      template,
      nextState,
    }: TTransitionTemplateStatePayload) => {
      await saveTemplateMutation.mutateAsync(template)
      await updateTemplateStateMutation.mutateAsync(nextState)
    },
  })

  return {
    mutate: transitionMutation.mutateAsync,
    isPending:
      transitionMutation.isPending ||
      saveTemplateMutation.isPending ||
      updateTemplateStateMutation.isPending,
    error:
      transitionMutation.error ||
      saveTemplateMutation.error ||
      updateTemplateStateMutation.error,
  }
}

type TUseCloseToRescanOrFinalizeMutationArgs = {
  volumeId?: string
  getValues: UseFormGetValues<TTemplate>
  setValue: UseFormSetValue<TTemplate>
  validateTemplateForNextState: (
    nextTemplateState: TemplateState
  ) => Promise<boolean>
}

export const useCloseToRescanOrFinalizeMutation = ({
  volumeId,
  getValues,
  setValue,
  validateTemplateForNextState,
}: TUseCloseToRescanOrFinalizeMutationArgs) => {
  const transitionTemplateStateMutation =
    useTransitionTemplateStateMutation(volumeId)

  const mutate = async ({
    nextState,
    shouldValidate,
  }: {
    nextState: TemplateState
    shouldValidate: boolean
  }) => {
    const isValid = shouldValidate
      ? await validateTemplateForNextState(nextState)
      : true

    if (!isValid) return

    const payload = getValues()

    // TODO delete, BE will handle this
    if (nextState === TemplateState.FINALIZED) {
      payload.items = payload.items.map((item) => applyItemLock(item, true))
    }

    try {
      await transitionTemplateStateMutation.mutate({
        template: payload,
        nextState,
      })
    } catch {
      return
    }

    setValue('state', nextState)

    if (nextState === TemplateState.FINALIZED) {
      setValue('items', payload.items)
    }
  }

  return {
    mutate,
    isPending: transitionTemplateStateMutation.isPending,
    error: transitionTemplateStateMutation.error,
  }
}
