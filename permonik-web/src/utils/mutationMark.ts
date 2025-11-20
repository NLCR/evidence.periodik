import { z } from 'zod'

export const mutationMarkTypeSchema = z.enum(['MARK', 'NUMBER'])
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

export function getMutationMarkLabel(value: TMutationMark): string {
  if (!value || !value.mark) return '-'

  return value.mark + (value.description ? ` (${value.description})` : '')
}

export function getMutationMarkCompoundValue(
  value: TMutationMark
): string | null | undefined {
  if (!value || !value.mark) return value?.mark ?? undefined

  return value.mark + (value.description ? ` (${value.description})` : '')
}

export function repairMutationMark(
  value: TMutationMark | undefined
): TMutationMark {
  if (!value) return emptyMutationMark

  return {
    ...value,
    mark: value.mark?.trim() ?? '',
    description: value.description?.trim() ?? '',
  }
}
