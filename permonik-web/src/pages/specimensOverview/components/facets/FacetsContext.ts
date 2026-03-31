import { createContext, useContext } from 'react'
import {
  type TSpecimenDamageTypes,
  type TSpecimensOverview,
} from '../../../../schema/specimen'
import { type TOwner } from '../../../../schema/owner'
import { type TMutation } from '../../../../schema/mutation'
import { type TParams } from '../../../../slices/useSpecimensOverviewStore'
import { type TSpecimensFacets } from '../../../../api/specimen'
import { type TEdition } from '../../../../schema/edition'
import { type TSupportedLanguages } from '../../../../i18next'

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
  specimens: TSpecimensOverview | undefined
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
