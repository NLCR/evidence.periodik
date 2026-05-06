import { z } from 'zod'

export const mutationMarkTypeSchema = z.enum(['MARK', 'NUMBER', 'UNMARKED'])
export type TMutationMarkType = z.infer<typeof mutationMarkTypeSchema>

export const mutationMarkSchema = z.object({
  mark: z.string().nullish(),
  type: mutationMarkTypeSchema.nullish(),
  description: z.string().nullish(),
})

export const MutationMarkTypeEnum = mutationMarkTypeSchema.Enum

export type TMutationMark = z.infer<typeof mutationMarkSchema>

export const emptyMutationMark: TMutationMark = {
  mark: '',
  type: MutationMarkTypeEnum.MARK,
  description: '',
}

export const UNMARKED_MUTATION_MARK_SYMBOL = '✓'

export function isUnmarkedMutationMark(
  value: TMutationMark | null | undefined
): boolean {
  return value?.type === MutationMarkTypeEnum.UNMARKED
}

export function hasMutationMark(
  value: TMutationMark | null | undefined
): boolean {
  if (!value) return false
  if (isUnmarkedMutationMark(value)) return true

  return !!value.mark?.trim()
}

export function getMutationMarkLabel(value: TMutationMark): string {
  if (isUnmarkedMutationMark(value)) return UNMARKED_MUTATION_MARK_SYMBOL
  if (!value || !value.mark) return '-'

  return value.mark + (value.description ? ` (${value.description})` : '')
}

export function getMutationMarkCompoundValue(
  value: TMutationMark
): string | null | undefined {
  if (isUnmarkedMutationMark(value)) return UNMARKED_MUTATION_MARK_SYMBOL
  if (!value || !value.mark) return value?.mark ?? undefined

  return value.mark + (value.description ? ` (${value.description})` : '')
}

export function repairMutationMark(
  value: TMutationMark | undefined
): TMutationMark {
  if (!value) return emptyMutationMark

  return {
    ...value,
    type: value.type ?? MutationMarkTypeEnum.MARK,
    mark: isUnmarkedMutationMark(value) ? '' : (value.mark?.trim() ?? ''),
    description: isUnmarkedMutationMark(value)
      ? ''
      : (value.description?.trim() ?? ''),
  }
}
