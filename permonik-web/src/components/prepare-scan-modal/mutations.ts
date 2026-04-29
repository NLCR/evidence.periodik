import { useMutation } from '@tanstack/react-query'
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form'
import {
  useSavePrepareScanTemplateMutation,
  useUpdatePrepareScanTemplateStateMutation,
} from '@/api/prepareScanModal'
import { TTemplate, TemplateState } from './schemas/schemas'
import { applyItemLock } from '@/components/prepare-scan-modal/steps/template/utils/templateItemLocking'

type TTransitionTemplateStatePayload = {
  template: TTemplate
  nextState: TemplateState
}

export const sanitizeTemplateForApi = (template: TTemplate): TTemplate => ({
  ...template,
  items: template.items.map((item) => {
    const itemWithoutVisible = { ...item }
    delete itemWithoutVisible.visible

    const replacementWithoutVisible = item.replacement
      ? { ...item.replacement }
      : item.replacement

    if (replacementWithoutVisible) {
      delete replacementWithoutVisible.visible
    }

    return {
      ...itemWithoutVisible,
      replacement: replacementWithoutVisible,
      pageReplacements: item.pageReplacements.map((replacement) => {
        const replacementWithoutVisible = { ...replacement }
        delete replacementWithoutVisible.visible
        return replacementWithoutVisible
      }),
    }
  }),
})

export const useTransitionTemplateStateMutation = (volumeId?: string) => {
  const saveTemplateMutation = useSavePrepareScanTemplateMutation(volumeId)
  const updateTemplateStateMutation =
    useUpdatePrepareScanTemplateStateMutation(volumeId)

  const transitionMutation = useMutation({
    mutationFn: async ({
      template,
      nextState,
    }: TTransitionTemplateStatePayload) => {
      await saveTemplateMutation.mutateAsync(sanitizeTemplateForApi(template))
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
