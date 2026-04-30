import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { FC } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutationListQuery } from '../../api/mutation'
import { useLanguageCode } from '../../hooks/useLanguageCode'
import MutationMarkField from './MutationMarkField'
import { PlanDigitalizationFilters } from './schemas'

type Props = {
  form: UseFormReturn<PlanDigitalizationFilters>
  onSubmit: (values: PlanDigitalizationFilters) => void
}

const Filters: FC<Props> = ({ form, onSubmit }) => {
  const { t } = useTranslation()
  const { control, handleSubmit } = form
  const { data: mutations = [] } = useMutationListQuery()
  const { languageCode } = useLanguageCode()

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'flex-end' } }}
    >
      <Box sx={{ width: '100%' }}>
        <Controller
          name="yearFrom"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
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
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
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
          name="mutationId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              select
              label={t('plan_digitalization_modal.mutation', {
                defaultValue: 'Mutace',
              })}
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
            <MutationMarkField
              value={field.value}
              label={t('plan_digitalization_modal.mutational_edition', {
                defaultValue: 'Mutační vydání',
              })}
              onChange={field.onChange}
            />
          )}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
        <Button type="submit" variant="contained">
          {t('common.confirm', { defaultValue: 'Potvrdit' })}
        </Button>
      </Box>
    </Stack>
  )
}

export default Filters
