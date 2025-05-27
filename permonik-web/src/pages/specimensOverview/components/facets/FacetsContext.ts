import { createContext, useContext } from 'react'
import { TSpecimenDamageTypes } from '../../../../schema/specimen'
import { TOwner } from '../../../../schema/owner'
import { TMutation } from '../../../../schema/mutation'
import { TParams } from '../../../../slices/useSpecimensOverviewStore'
import { TSpecimenList, TSpecimensFacets } from '../../../../api/specimen'
import { TEdition } from '../../../../schema/edition'
import { TSupportedLanguages } from '../../../../i18next'

type TFacetsContext = {
  facets: TSpecimensFacets | undefined
  disabled: boolean
  params: TParams
  setParams: (params: TParams) => void
  mutations: TMutation[] | undefined
  languageCode: TSupportedLanguages
  owners: TOwner[] | undefined
  damageTypes: TSpecimenDamageTypes[]
  editions: TEdition[] | undefined
  isError: boolean
  isFetching: boolean
  specimens: TSpecimenList | undefined
  calendarDateFromQuery: number | undefined
}

export const FacetsContext = createContext<TFacetsContext | undefined>(
  undefined
)

export const useFacetsContext = (): TFacetsContext => {
  const ctx = useContext(FacetsContext)
  if (!ctx)
    throw new Error(
      'useFacetsContext must be used within FacetsContext.Provider'
    )
  return ctx
}
