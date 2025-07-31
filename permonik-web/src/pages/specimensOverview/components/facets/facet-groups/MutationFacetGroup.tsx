import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'

const MutationFacetGroup = () => {
  const { facets, disabled, params, setParams, mutations, languageCode } =
    useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.mutationIds.length
          ? facets.mutationIds.map((m) => ({
              name: m.name,
              count: m.count,
              displayedName: mutations?.find((mc) => mc.id === m.name)?.name[
                languageCode
              ],
            }))
          : params.mutationIds.map((p) => ({
              name: p,
              count: 0,
              displayedName: mutations?.find((mc) => mc.id === p)?.name[
                languageCode
              ],
            }))
      }
      header={t('specimens_overview.mutation')}
      onChange={(value) => setParams({ ...params, mutationIds: value })}
      values={params.mutationIds}
    />
  )
}

export default MutationFacetGroup
