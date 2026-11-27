import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOwnerListQuery } from '@/api/owner'
import { useMutationListQuery } from '@/api/mutation'
import { useLanguageCode } from '@/hooks/useLanguageCode'
import MutationMarkSelectorModal from '@/components/MutationMarkSelectorModal'
import {
  getMutationMarkCompoundValue,
  UNMARKED_MUTATION_MARK_SYMBOL,
  type TMutationMark,
} from '@/utils/mutationMark'
import { type TReplacementSource } from '../../schemas/schemas'

type Props = {
  value: TReplacementSource
  onChange: (value: TReplacementSource) => void
  disabled: boolean
}

const parseMutationEdition = (
  value: string | null | undefined
): TMutationMark => {
  if (value === UNMARKED_MUTATION_MARK_SYMBOL) {
    return { type: 'UNMARKED', mark: '', description: '' }
  }
  const match = /^(\d+|\?)(?: \((.*)\))?$/.exec(value ?? '')
  return match
    ? { type: 'NUMBER', mark: match[1], description: match[2] ?? '' }
    : { type: 'MARK', mark: value ?? '', description: '' }
}

const ManualReplacementSourceInput = ({ value, onChange, disabled }: Props) => {
  const { t } = useTranslation()
  const { languageCode } = useLanguageCode()
  const owners = useOwnerListQuery()
  const mutations = useMutationListQuery()
  const [isMarkEditorOpen, setIsMarkEditorOpen] = useState(false)

  return (
    <>
      <TextField
        fullWidth
        label={t('common.fields.signature')}
        value={value.signature ?? ''}
        onChange={(event) =>
          onChange({ ...value, signature: event.target.value })
        }
        disabled={disabled}
      />
      <TextField
        select
        fullWidth
        label={t('common.fields.owner')}
        value={value.owner ?? ''}
        onChange={(event) => onChange({ ...value, owner: event.target.value })}
        disabled={disabled || owners.isPending || owners.isError}
        error={owners.isError}
        helperText={
          owners.isError
            ? t('common.error_occurred_when_loading_data')
            : undefined
        }
      >
        <MenuItem value="">—</MenuItem>
        {value.owner &&
          !owners.data?.some((owner) => owner.sigla === value.owner) && (
            <MenuItem value={value.owner}>{value.owner}</MenuItem>
          )}
        {owners.data?.map((owner) => (
          <MenuItem key={owner.id} value={owner.sigla}>
            {owner.shorthand}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label={t('prepare_scan_modal.content_template.replacement_barcode')}
        value={value.barcode ?? ''}
        onChange={(event) =>
          onChange({ ...value, barcode: event.target.value })
        }
        disabled={disabled}
      />
      <TextField
        select
        fullWidth
        label={t('common.fields.mutation')}
        value={value.mutation ?? ''}
        onChange={(event) =>
          onChange({ ...value, mutation: event.target.value })
        }
        disabled={disabled || mutations.isPending || mutations.isError}
        error={mutations.isError}
        helperText={
          mutations.isError
            ? t('common.error_occurred_when_loading_data')
            : undefined
        }
      >
        <MenuItem value="">—</MenuItem>
        {value.mutation &&
          !mutations.data?.some(
            (mutation) => mutation.name.cs === value.mutation
          ) && <MenuItem value={value.mutation}>{value.mutation}</MenuItem>}
        {mutations.data?.map((mutation) => (
          <MenuItem key={mutation.id} value={mutation.name.cs}>
            {mutation.name[languageCode]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label={t('common.fields.mutation_mark')}
        value={value.mutationEdition ?? ''}
        disabled={disabled}
        slotProps={{ input: { readOnly: true } }}
        onClick={() => !disabled && setIsMarkEditorOpen(true)}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            setIsMarkEditorOpen(true)
          }
        }}
      />
      {isMarkEditorOpen && (
        <MutationMarkSelectorModal
          open
          value={parseMutationEdition(value.mutationEdition)}
          onClose={() => setIsMarkEditorOpen(false)}
          onSave={(mutationMark) =>
            onChange({
              ...value,
              mutationEdition: getMutationMarkCompoundValue(mutationMark) ?? '',
            })
          }
        />
      )}
    </>
  )
}

export default ManualReplacementSourceInput
