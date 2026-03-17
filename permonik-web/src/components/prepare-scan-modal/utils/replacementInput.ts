import { TReplacement, TReplacementSource } from '../schemas'

export type TReplacementSelectOption = {
  id: string
  label: string
  replacement: TReplacementSource & Partial<Pick<TReplacement, 'pages'>>
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
