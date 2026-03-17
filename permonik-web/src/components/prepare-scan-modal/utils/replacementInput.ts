import { emptyReplacement, TReplacement, TReplacementSource } from '../schemas'

export type TReplacementSelectOption = {
  id: string
  label: string
  replacement: TReplacementSource & Partial<Pick<TReplacement, 'pages'>>
}

export const mapSelectOptionToReplacement = (
  option: TReplacementSelectOption,
  currentValue: TReplacement | TReplacementSource | null
): TReplacement => {
  const currentPages =
    currentValue && 'pages' in currentValue
      ? currentValue.pages
      : emptyReplacement.pages

  return {
    ...emptyReplacement,
    ...currentValue,
    ...option.replacement,
    pages: option.replacement.pages ?? currentPages,
  }
}

export const buildReplacementOptionLabel = (
  replacement: TReplacement | TReplacementSource
) => {
  const signature = replacement.signature || '-'
  const owner = replacement.owner || '-'
  const mutation = replacement.mutation || '-'
  const edition = replacement.mutationEdition || '-'

  return `${signature} · ${owner} · ${mutation} · ${edition}`
}

export const normalizeReplacement = (
  replacement: TReplacement | TReplacementSource | null
): TReplacement => ({
  ...emptyReplacement,
  ...(replacement ?? {}),
})
