import { useDebounce } from '@uidotdev/usehooks'
import { useEffect, useMemo } from 'react'
import { type UseFormReturn, useWatch } from 'react-hook-form'
import { type TMutationMark } from '@/utils/mutationMark'
import { usePlanningFacetsQuery } from './api'
import { type PlanDigitalizationFilters } from './schemas'

type Options = {
  form: UseFormReturn<PlanDigitalizationFilters>
  hasYearRange: boolean
  hasSubmitted: boolean
  disabled: boolean
  onSubmit: (values: PlanDigitalizationFilters, automatic?: boolean) => void
}

export const editionKey = ({ type, mark }: TMutationMark) =>
  JSON.stringify([type, mark ?? null])

export const usePlanningFacetFilters = ({
  form: {
    control,
    setValue,
    formState: { isValid, isValidating },
  },
  hasYearRange,
  hasSubmitted,
  disabled,
  onSubmit,
}: Options) => {
  const [metaTitleId, yearFrom, yearTo, mutation, mutationalEdition] = useWatch(
    {
      control,
      name: [
        'metaTitleId',
        'yearFrom',
        'yearTo',
        'mutation',
        'mutationalEdition',
      ],
    }
  )
  const yearKey = `${yearFrom}:${yearTo}`
  const debouncedYears = useDebounce(yearKey, 500)
  const waitingForYears = yearKey !== debouncedYears
  const canLoadFacets =
    hasYearRange && isValid && !isValidating && !waitingForYears
  const params = useMemo(
    () =>
      canLoadFacets
        ? { metaTitleId, yearFrom, yearTo, mutation, mutationalEdition }
        : null,
    [canLoadFacets, metaTitleId, yearFrom, yearTo, mutation, mutationalEdition]
  )
  const { data, isSuccess, isFetching, fetchStatus } =
    usePlanningFacetsQuery(params)

  useEffect(() => {
    if (!params) return

    const { mutation, mutationalEdition } = params
    if (isSuccess && fetchStatus === 'idle' && data) {
      const resetMutation =
        mutation && !data.mutations.some(({ item }) => item.id === mutation.id)
      const resetEdition =
        mutationalEdition &&
        !data.mutationalEditions.some(
          ({ item }) => editionKey(item) === editionKey(mutationalEdition)
        )

      if (resetMutation) setValue('mutation', null, { shouldDirty: true })
      if (resetEdition)
        setValue('mutationalEdition', null, { shouldDirty: true })
      if (resetMutation || resetEdition) return
    }

    if (disabled || (isFetching && (mutation || mutationalEdition))) return
    if (hasSubmitted || (mutation && mutationalEdition)) onSubmit(params, true)
  }, [
    params,
    data,
    isSuccess,
    fetchStatus,
    isFetching,
    setValue,
    disabled,
    hasSubmitted,
    onSubmit,
  ])

  return {
    mutationOptions: data?.mutations ?? [],
    editionOptions: data?.mutationalEditions ?? [],
    selectsDisabled:
      disabled || isFetching || (hasYearRange && isValid && waitingForYears),
  }
}
