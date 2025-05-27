import React, { PropsWithChildren } from 'react'
import { TMetaTitle } from '../../../../schema/metaTitle'
import { useFacetsData } from './api'
import { damageTypes } from '../../../../utils/constants'
import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { FacetsContext } from './FacetsContext'

type Props = { metaTitle: TMetaTitle }

const FacetsContextProvider = ({
  metaTitle,
  children,
}: Props & PropsWithChildren) => {
  const {
    editions,
    facets,
    mutations,
    owners,
    specimens,
    calendarDateFromQuery,
    languageCode,
    isError,
    isFetching,
  } = useFacetsData(metaTitle)

  const params = useSpecimensOverviewStore((state) => state.params)
  const setParams = useSpecimensOverviewStore((state) => state.setParams)

  return (
    <FacetsContext.Provider
      value={{
        damageTypes: damageTypes,
        disabled: isFetching,
        editions: editions,
        facets: facets,
        languageCode: languageCode,
        mutations: mutations,
        owners: owners,
        specimens: specimens,
        calendarDateFromQuery: calendarDateFromQuery,
        params: params,
        setParams: setParams,
        isError: isError,
        isFetching: isFetching,
      }}
    >
      {children}
    </FacetsContext.Provider>
  )
}

export default FacetsContextProvider
