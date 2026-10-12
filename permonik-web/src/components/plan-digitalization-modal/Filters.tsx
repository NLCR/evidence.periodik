import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { type FC, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutationListQuery } from '@/api/mutation'
import { useLanguageCode } from '@/hooks/useLanguageCode'
import { getMutationMarkCompoundValue } from '@/utils/mutationMark'
import MutationMarkSelectorModal from '@/components/MutationMarkSelectorModal'
import { type PlanDigitalizationFilters } from './schemas'

type Props = {
  form: UseFormReturn<PlanDigitalizationFilters>
  onSubmit: (values: PlanDigitalizationFilters) => void
}

const Filters: FC<Props> = ({ form, onSubmit }) => {
  const { t } = useTranslation()
  const { control, formState, handleSubmit } = form
  const { data: mutations = [] } = useMutationListQuery()
  const { languageCode } = useLanguageCode()
  const [mutationMarkModalOpened, setMutationMarkModalOpened] = useState(false)

  return (
    <Stack
      direction={'column'}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        paddingTop={1}
        sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <Box sx={{ width: '100%' }}>
          <Controller
            name="yearFrom"
            control={control}
            rules={{
              required: t('plan_digitalization_modal.year_required', {
                defaultValue: 'Zadejte rok od',
              }),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                error={!!formState.errors.yearFrom}
                helperText={formState.errors.yearFrom?.message}
                label={t('plan_digitalization_modal.year_from', {
                  defaultValue: 'Rok od',
                })}
                type="number"
              />
            )}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Controller
            name="yearTo"
            control={control}
            rules={{
              required: t('plan_digitalization_modal.year_required', {
                defaultValue: 'Zadejte rok do',
              }),
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                error={!!formState.errors.yearTo}
                helperText={formState.errors.yearTo?.message}
                label={t('plan_digitalization_modal.year_to', {
                  defaultValue: 'Rok do',
                })}
                type="number"
              />
            )}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Controller
            name="mutation"
            control={control}
            render={({ field }) => (
              <TextField
                name={field.name}
                inputRef={field.ref}
                onBlur={field.onBlur}
                fullWidth
                select
                value={field.value?.id ?? ''}
                onChange={(event) => {
                  const selectedMutation = mutations.find(
                    (mutation) => mutation.id === event.target.value
                  )

                  field.onChange(selectedMutation ?? null)
                }}
                label={t('plan_digitalization_modal.mutation', {
                  defaultValue: 'Mutace',
                })}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  select: {
                    displayEmpty: true,
                  },
                }}
              >
                <MenuItem value="">
                  {t('common.all', { defaultValue: 'Vše' })}
                </MenuItem>
                {mutations.map((mutation) => (
                  <MenuItem key={mutation.id} value={mutation.id}>
                    {mutation.name[languageCode]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Controller
            name="mutationalEdition"
            control={control}
            render={({ field }) => (
              <>
                <TextField
                  name={field.name}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  fullWidth
                  label={t('plan_digitalization_modal.mutational_edition', {
                    defaultValue: 'Mutační vydání',
                  })}
                  value={getMutationMarkCompoundValue(field.value) ?? ''}
                  onClick={() => setMutationMarkModalOpened(true)}
                  slotProps={{ input: { readOnly: true } }}
                />
                <MutationMarkSelectorModal
                  value={field.value}
                  open={mutationMarkModalOpened}
                  onClose={() => setMutationMarkModalOpened(false)}
                  onSave={field.onChange}
                />
              </>
            )}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Button type="submit" variant="contained" fullWidth>
            {t('common.confirm', { defaultValue: 'Potvrdit' })}
          </Button>
        </Box>
      </Stack>
    </Stack>
  )
}

export default Filters
