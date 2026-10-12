import i18next from '@/i18next'
import {
  type FieldPath,
  type UseFormClearErrors,
  type UseFormGetValues,
  type UseFormSetError,
  type UseFormTrigger,
} from 'react-hook-form'
import {
  TemplateState,
  ResolutionStatus,
  type TMainReplacement,
  type TReplacement,
  type TTemplate,
} from '../schemas/schemas'

export type TTemplateTransitionState =
  | TemplateState.WAITING_FOR_RESCAN
  | TemplateState.FINALIZED

export type TTemplateTransitionIssue = {
  path: string
  message: string
  reason: 'status' | 'source' | 'pages' | 'overlapping_pages'
}

type TReplacementValidationOptions = {
  requirePages: boolean
}

type TValidationMessageKey =
  | 'prepare_scan_modal.validation.waiting_for_rescan'
  | 'prepare_scan_modal.validation.finalized'

const hasReplacementSource = (replacement: TMainReplacement | TReplacement) =>
  !!(
    replacement.volume.volumeId ||
    replacement.volume.signature?.trim() ||
    replacement.volume.owner?.trim() ||
    replacement.volume.barcode?.trim() ||
    replacement.volume.mutation?.trim() ||
    replacement.volume.mutationEdition?.trim()
  )

const hasValidPages = (pages: number[]) =>
  pages.length > 0 &&
  pages.every(
    (pageNumber, index) =>
      Number.isInteger(pageNumber) &&
      pageNumber > 0 &&
      (index === 0 || pages[index - 1] < pageNumber)
  )

const isReplacementFilled = (
  replacement: TMainReplacement | TReplacement,
  options: TReplacementValidationOptions
) => {
  if (!hasReplacementSource(replacement)) return false

  if (!options.requirePages) return true

  return hasValidPages(replacement.pages)
}

const hasOverlappingAssignedPages = (replacements: TReplacement[]) => {
  const assignedPages = new Set<number>()

  return replacements.some((replacement) => {
    if (replacement.status !== ResolutionStatus.ASSIGNED) return false

    return replacement.pages.some((pageNumber) => {
      if (assignedPages.has(pageNumber)) return true
      assignedPages.add(pageNumber)
      return false
    })
  })
}

const isValidForWaitingForRescan = (
  replacement: TMainReplacement | TReplacement,
  options: TReplacementValidationOptions
) =>
  replacement.status === ResolutionStatus.UNREPLACEABLE ||
  (replacement.status === ResolutionStatus.WAITING_FOR_RESCAN &&
    (!options.requirePages || hasValidPages(replacement.pages))) ||
  (replacement.status === ResolutionStatus.ASSIGNED &&
    isReplacementFilled(replacement, options))

const isValidForFinalized = (
  replacement: TMainReplacement | TReplacement,
  options: TReplacementValidationOptions
) =>
  replacement.status === ResolutionStatus.UNREPLACEABLE ||
  (replacement.status === ResolutionStatus.ASSIGNED &&
    isReplacementFilled(replacement, options))

const transitionStateConfig: Record<
  TTemplateTransitionState,
  {
    validateReplacement: (
      replacement: TMainReplacement | TReplacement,
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
    replacement: TMainReplacement | TReplacement,
    path: string,
    options: TReplacementValidationOptions
  ) => {
    if (validateByState(replacement, options)) return

    const invalidPages =
      options.requirePages &&
      !hasValidPages(replacement.pages) &&
      ((replacement.status === ResolutionStatus.ASSIGNED &&
        hasReplacementSource(replacement)) ||
        replacement.status === ResolutionStatus.WAITING_FOR_RESCAN)

    issues.push({
      path: invalidPages ? path.replace(/\.volume$/, '.pages') : path,
      message: invalidPages
        ? i18next.t('prepare_scan_modal.validation.invalid_pages')
        : replacement.status === ResolutionStatus.ASSIGNED
          ? i18next.t('prepare_scan_modal.validation.source_required')
          : replacement.status === ResolutionStatus.WAITING_FOR_RESCAN &&
              targetState === TemplateState.FINALIZED
            ? i18next.t('prepare_scan_modal.validation.rescan_pending')
            : i18next.t(messageKey),
      reason: invalidPages
        ? 'pages'
        : replacement.status === ResolutionStatus.ASSIGNED
          ? 'source'
          : 'status',
    })
  }

  template.items.forEach((item, itemIndex) => {
    if (item.mainScan.type === 'REPLACEMENT') {
      validateReplacement(
        item.mainScan.replacement,
        `items.${itemIndex}.mainScan.replacement.volume`,
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

    if (hasOverlappingAssignedPages(item.pageReplacements)) {
      item.pageReplacements.forEach((replacement, pageReplacementIndex) => {
        if (replacement.status !== ResolutionStatus.ASSIGNED) return
        issues.push({
          path: `items.${itemIndex}.pageReplacements.${pageReplacementIndex}.pages`,
          message: i18next.t('prepare_scan_modal.validation.overlapping_pages'),
          reason: 'overlapping_pages',
        })
      })
    }
  })

  return issues
}

type TValidateTemplateForNextStateArgs = {
  trigger: UseFormTrigger<TTemplate>
  clearErrors: UseFormClearErrors<TTemplate>
  setError: UseFormSetError<TTemplate>
  getValues: UseFormGetValues<TTemplate>
  nextTemplateState: TTemplateTransitionState
  onIssues?: (issues: TTemplateTransitionIssue[]) => void
}

export const validateTemplateForNextState = async ({
  trigger,
  clearErrors,
  setError,
  getValues,
  nextTemplateState,
  onIssues,
}: TValidateTemplateForNextStateArgs): Promise<boolean> => {
  const isBaseValid = await trigger()
  if (!isBaseValid) {
    console.warn(
      '[PerMonik] Template form validation failed before transition checks'
    )
    return false
  }

  clearErrors('items')

  const transitionIssues = validateTemplateForTransition(
    getValues(),
    nextTemplateState
  )

  if (transitionIssues.length > 0) {
    console.warn('[PerMonik] Template validation failed', {
      targetState: nextTemplateState,
      count: transitionIssues.length,
      issues: transitionIssues.slice(0, 20).map(({ path, reason }) => ({
        path,
        reason,
      })),
    })
    onIssues?.(transitionIssues)
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
