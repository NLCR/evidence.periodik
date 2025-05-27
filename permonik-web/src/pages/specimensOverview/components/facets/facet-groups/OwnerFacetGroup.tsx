import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'

const OwnerFacetGroup = () => {
  const { facets, disabled, params, setParams, owners } = useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.ownerIds.length
          ? facets.ownerIds.map((m) => ({
              name: m.name,
              count: m.count,
              displayedName: owners?.find((mc) => mc.id === m.name)?.shorthand,
            }))
          : params.ownerIds.map((p) => ({
              name: p,
              count: 0,
              displayedName: owners?.find((mc) => mc.id === p)?.shorthand,
            }))
      }
      header={t('specimens_overview.owner')}
      onChange={(value) =>
        setParams({
          ...params,
          ownerIds: value,
        })
      }
      values={params.ownerIds}
    />
  )
}

export default OwnerFacetGroup
