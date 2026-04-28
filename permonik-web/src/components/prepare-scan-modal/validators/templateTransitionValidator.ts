import i18next from '@/i18next'
import {
  FieldPath,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormSetError,
  UseFormTrigger,
} from 'react-hook-form'
import { TemplateState, TReplacement, TTemplate } from '../schemas/schemas'

export type TTemplateTransitionState =
  | TemplateState.WAITING_FOR_RESCAN
  | TemplateState.FINALIZED

export type TTemplateTransitionIssue = {
  path: string
  message: string
}

type TReplacementValidationOptions = {
  requirePages: boolean
}

type TValidationMessageKey =
  | 'prepare_scan_modal.validation.waiting_for_rescan'
  | 'prepare_scan_modal.validation.finalized'

const hasAnyText = (value: string | null | undefined) =>
  !!value && value.trim().length > 0

const isReplacementFilled = (
  replacement: TReplacement,
  options: TReplacementValidationOptions
) => {
  const hasVolumeData =
    hasAnyText(replacement.volume.id) ||
    hasAnyText(replacement.volume.signature) ||
    hasAnyText(replacement.volume.owner) ||
    hasAnyText(replacement.volume.barcode) ||
    hasAnyText(replacement.volume.mutation) ||
    hasAnyText(replacement.volume.mutationEdition)

  if (!options.requirePages) return hasVolumeData

  return hasVolumeData && hasAnyText(replacement.pages)
}

const isValidForWaitingForRescan = (
  replacement: TReplacement,
  options: TReplacementValidationOptions
) =>
  isReplacementFilled(replacement, options) ||
  replacement.isUnreplaceable ||
  replacement.isWaitingForRescan

const isValidForFinalized = (
  replacement: TReplacement,
  options: TReplacementValidationOptions
) =>
  (isReplacementFilled(replacement, options) || replacement.isUnreplaceable) &&
  !replacement.isWaitingForRescan

const transitionStateConfig: Record<
  TTemplateTransitionState,
  {
    validateReplacement: (
      replacement: TReplacement,
      options: TReplacementValidationOptions
    ) => boolean
    messageKey: TValidationMessageKey
  }
> = {
  [TemplateState.WAITING_FOR_RESCAN]: {
    validateReplacement: isValidForWaitingForRescan,
    messageKey: 'prepare_scan_modal.validation.waiting_for_rescan',
  },
  [TemplateState.FINALIZED]: {
    validateReplacement: isValidForFinalized,
    messageKey: 'prepare_scan_modal.validation.finalized',
  },
}

export const validateTemplateForTransition = (
  template: TTemplate,
  targetState: TTemplateTransitionState
): TTemplateTransitionIssue[] => {
  const issues: TTemplateTransitionIssue[] = []
  const { validateReplacement: validateByState, messageKey } =
    transitionStateConfig[targetState]

  const validateReplacement = (
    replacement: TReplacement,
    path: string,
    options: TReplacementValidationOptions
  ) => {
    if (!validateByState(replacement, options)) {
      issues.push({
        path,
        message: i18next.t(messageKey),
      })
    }
  }

  template.items.forEach((item, itemIndex) => {
    if (item.specimen.numMissing && item.replacement) {
      validateReplacement(
        item.replacement,
        `items.${itemIndex}.replacement.volume`,
        {
          requirePages: false,
        }
      )
    }

    item.pageReplacements.forEach((replacement, pageReplacementIndex) => {
      validateReplacement(
        replacement,
        `items.${itemIndex}.pageReplacements.${pageReplacementIndex}.volume`,
        { requirePages: true }
      )
    })
  })

  return issues
}

type TValidateTemplateForNextStateArgs = {
  trigger: UseFormTrigger<TTemplate>
  clearErrors: UseFormClearErrors<TTemplate>
  setError: UseFormSetError<TTemplate>
  getValues: UseFormGetValues<TTemplate>
  nextTemplateState: TTemplateTransitionState
}

export const validateTemplateForNextState = async ({
  trigger,
  clearErrors,
  setError,
  getValues,
  nextTemplateState,
}: TValidateTemplateForNextStateArgs): Promise<boolean> => {
  const isBaseValid = await trigger()
  if (!isBaseValid) return false

  clearErrors('items')

  const transitionIssues = validateTemplateForTransition(
    getValues(),
    nextTemplateState
  )

  if (transitionIssues.length > 0) {
    transitionIssues.forEach((issue) => {
      setError(issue.path as FieldPath<TTemplate>, {
        type: 'manual',
        message: issue.message,
      })
    })
    return false
  }

  return true
}
