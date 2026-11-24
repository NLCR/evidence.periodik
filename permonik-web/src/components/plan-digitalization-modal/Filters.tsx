import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useController, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLanguageCode } from '@/hooks/useLanguageCode'
import { getMutationMarkLabel } from '@/utils/mutationMark'
import FacetSelect from './FacetSelect'
import YearRangeFields from './YearRangeFields'
import { editionKey, usePlanningFacetFilters } from './usePlanningFacetFilters'
import { type PlanDigitalizationFilters } from './schemas'

type Props = {
  form: UseFormReturn<PlanDigitalizationFilters>
  onSubmit: (values: PlanDigitalizationFilters, automatic?: boolean) => void
  disabled: boolean
  hasSubmitted: boolean
  minYear: number | undefined
  maxYear: number | undefined
}

const Filters = ({
  form,
  onSubmit,
  disabled,
  hasSubmitted,
  minYear,
  maxYear,
}: Props) => {
  const { t } = useTranslation()
  const { languageCode } = useLanguageCode()
  const { control, handleSubmit } = form
  const { field: mutation } = useController({ control, name: 'mutation' })
  const { field: edition } = useController({
    control,
    name: 'mutationalEdition',
  })
  const hasYearRange =
    minYear !== undefined && maxYear !== undefined && minYear <= maxYear
  const canSubmit = hasYearRange && !disabled
  const { mutationOptions, editionOptions, selectsDisabled } =
    usePlanningFacetFilters({
      form,
      hasYearRange,
      hasSubmitted,
      disabled,
      onSubmit,
    })

  return (
    <Stack
      component="form"
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      paddingTop={1}
      sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'flex-start' } }}
      noValidate
      onSubmit={handleSubmit((values) => {
        if (canSubmit) onSubmit(values)
      })}
    >
      <YearRangeFields
        form={form}
        minYear={minYear}
        maxYear={maxYear}
        disabled={disabled}
      />
      <FacetSelect
        field={mutation}
        options={mutationOptions}
        label={t('plan_digitalization_modal.mutation')}
        disabled={selectsDisabled}
        getKey={(item) => item.id}
        getLabel={(item) => item.name[languageCode]}
      />
      <FacetSelect
        field={edition}
        options={editionOptions}
        label={t('plan_digitalization_modal.mutational_edition')}
        disabled={selectsDisabled}
        getKey={editionKey}
        getLabel={(item) => getMutationMarkLabel(item, 'long')}
      />
      <Box
        sx={{ minHeight: { md: 56 }, display: 'flex', alignItems: 'center' }}
      >
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!canSubmit}
        >
          {t('common.confirm')}
        </Button>
      </Box>
    </Stack>
  )
}

export default Filters
