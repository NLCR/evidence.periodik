import { useGetSpecimenNamesAndSubNames } from '../api/specimen'
import sortBy from 'lodash/sortBy'
import deburr from 'lodash/deburr'

const useSortedSpecimensNamesAndSubNames = () => {
  const { data } = useGetSpecimenNamesAndSubNames()

  const names = sortBy(
    data?.names.filter((n) => n.length > 0),
    (obj) => `${deburr(obj)}`
  )
  const subNames = sortBy(
    data?.subNames.filter((n) => n.length > 0),
    (obj) => `${deburr(obj)}`
  )

  return { names, subNames }
}

export default useSortedSpecimensNamesAndSubNames
