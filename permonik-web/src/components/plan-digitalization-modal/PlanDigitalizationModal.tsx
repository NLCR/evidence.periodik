import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { hashKey } from '@tanstack/react-query'
import { type PropsWithChildren, useCallback, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSpecimensOverviewStore } from '@/slices/useSpecimensOverviewStore'
import ModalContainer from '../ModalContainer'
import { usePlanDigitalizationQuery } from './api'
import Filters from './Filters'
import LibrariesTable from './LibrariesTable'
import {
  createPlanDigitalizationFiltersSchema,
  type PlanDigitalizationFilters,
} from './schemas'

type Props = {
  onClose: () => void
  metaTitleId: string
  metatitle: string
  minYear: number | undefined
  maxYear: number | undefined
}

const EmptyState = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      alignItems: 'center',
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 1,
      display: 'flex',
      justifyContent: 'center',
      minHeight: 160,
      p: 4,
      textAlign: 'center',
    }}
  >
    <Typography color="text.secondary">{children}</Typography>
  </Box>
)

const PlanDigitalizationModal = ({
  onClose,
  metaTitleId,
  metatitle,
  minYear,
  maxYear,
}: Props) => {
  const { t } = useTranslation()
  const sliderRange = useSpecimensOverviewStore((state) =>
    state.view === 'TABLE' && state.lastViewedMetaTitleId === metaTitleId
      ? state.sliderRange
      : null
  )
  const [from, to] = sliderRange ?? []
  const [submittedFilters, setSubmittedFilters] =
    useState<PlanDigitalizationFilters | null>(null)

  const filtersSchema = useMemo(
    () => createPlanDigitalizationFiltersSchema(minYear, maxYear),
    [minYear, maxYear]
  )
  const form = useForm<PlanDigitalizationFilters>({
    mode: 'onChange',
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      metaTitleId,
      yearFrom: (from?.isValid() ? from.year() : minYear) ?? NaN,
      yearTo: (to?.isValid() ? to.year() : maxYear) ?? NaN,
      mutation: null,
      mutationalEdition: null,
    },
  })
  const draftFilters = useWatch({ control: form.control })

  const {
    data = [],
    isFetching,
    isError,
    refetch,
  } = usePlanDigitalizationQuery(submittedFilters)

  const submitFilters = useCallback(
    (values: PlanDigitalizationFilters, automatic = false) => {
      if (isFetching) return

      if (hashKey([values]) !== hashKey([submittedFilters])) {
        setSubmittedFilters(values)
      } else if (!automatic) {
        void refetch()
      }
    },
    [isFetching, refetch, submittedFilters]
  )

  return (
    <ModalContainer
      opened
      onClose={onClose}
      closeButton={{ callback: onClose }}
      header={`${t('plan_digitalization_modal.title')} - ${metatitle}`}
      minWidth="70vw"
      maxWidth="1200px"
      maxHeight="85vh"
    >
      <Stack spacing={2}>
        <Filters
          form={form}
          onSubmit={submitFilters}
          disabled={isFetching}
          hasSubmitted={submittedFilters !== null}
          minYear={minYear}
          maxYear={maxYear}
        />

        {isFetching && (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
            <CircularProgress
              aria-label={t('plan_digitalization_modal.results_loading')}
            />
          </Box>
        )}

        {!isFetching && !isError && !submittedFilters ? (
          <EmptyState>
            {minYear !== undefined &&
            maxYear !== undefined &&
            minYear <= maxYear
              ? t('plan_digitalization_modal.select_filters')
              : t('plan_digitalization_modal.year_range_unavailable')}
          </EmptyState>
        ) : null}

        {!isFetching && !isError && submittedFilters && !data.length ? (
          <EmptyState>{t('plan_digitalization_modal.no_results')}</EmptyState>
        ) : null}

        {!isFetching && !isError && submittedFilters && data.length ? (
          <LibrariesTable key={hashKey([draftFilters])} data={data} />
        ) : null}
      </Stack>
    </ModalContainer>
  )
}

export default PlanDigitalizationModal
