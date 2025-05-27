import { useEditionListQuery } from '../../../../api/edition'
import { useMutationListQuery } from '../../../../api/mutation'
import { useOwnerListQuery } from '../../../../api/owner'
import {
  useSpecimenFacetsQuery,
  useSpecimenListQuery,
  useSpecimensStartDateForCalendar,
} from '../../../../api/specimen'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'
import { TMetaTitle } from '../../../../schema/metaTitle'

export const useFacetsData = (metaTitle: TMetaTitle) => {
  const { data: mutations } = useMutationListQuery()
  const { data: editions } = useEditionListQuery()
  const { data: owners } = useOwnerListQuery()
  const { languageCode } = useLanguageCode()

  const {
    data: facets,
    isError: facetsError,
    isFetching: facetsFetching,
  } = useSpecimenFacetsQuery(metaTitle.id)

  const {
    data: specimens,
    isError: specimensError,
    isFetching: specimensFetching,
  } = useSpecimenListQuery(metaTitle.id)

  const {
    data: calendarDateFromQuery,
    isFetching: calendarStartDateFetching,
    isError: calendarStartDateError,
  } = useSpecimensStartDateForCalendar(metaTitle.id)

  return {
    mutations,
    editions,
    owners,
    languageCode,
    facets,
    specimens,
    calendarDateFromQuery,
    isFetching:
      facetsFetching || specimensFetching || calendarStartDateFetching,
    isError: facetsError || specimensError || calendarStartDateError,
  }
}
