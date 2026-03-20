import i18next from '../../../i18next'
import { TemplateState, TReplacement, TTemplate } from '../schemas/schemas'

export type TTemplateTransitionState =
  | TemplateState.WAITING_FOR_RESCAN
  | TemplateState.FINALIZED

export type TTemplateTransitionIssue = {
  path: string
  message: string
}

const hasAnyText = (value: string | null | undefined) =>
  !!value && value.trim().length > 0

const isReplacementFilled = (
  replacement: TReplacement,
  options: { requirePages: boolean }
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

const isReplacementValidForWaitingForRescan = (
  replacement: TReplacement,
  options: { requirePages: boolean }
) =>
  isReplacementFilled(replacement, options) ||
  replacement.isUnreplaceable ||
  replacement.isWaitingForRescan

const isReplacementValidForFinalized = (
  replacement: TReplacement,
  options: { requirePages: boolean }
) =>
  (isReplacementFilled(replacement, options) || replacement.isUnreplaceable) &&
  !replacement.isWaitingForRescan

export const validateTemplateForTransition = (
  template: TTemplate,
  targetState: TTemplateTransitionState
): TTemplateTransitionIssue[] => {
  const issues: TTemplateTransitionIssue[] = []

  const validateReplacement = (
    replacement: TReplacement,
    path: string,
    options: { requirePages: boolean }
  ) => {
    const isValidForState =
      targetState === TemplateState.WAITING_FOR_RESCAN
        ? isReplacementValidForWaitingForRescan(replacement, options)
        : isReplacementValidForFinalized(replacement, options)

    if (!isValidForState) {
      issues.push({
        path,
        message:
          targetState === TemplateState.WAITING_FOR_RESCAN
            ? i18next.t('prepare_scan_modal.validation.waiting_for_rescan')
            : i18next.t('prepare_scan_modal.validation.finalized'),
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
