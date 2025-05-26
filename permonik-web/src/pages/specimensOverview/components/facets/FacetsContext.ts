import { createContext, useContext } from 'react'

export const FacetsContext = createContext(null) //TODO

export const useFacetsContext = () => useContext(FacetsContext)
