import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'

const NameFacetGroup = () => {
  const { facets, disabled, params, setParams } = useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.names.length
          ? facets.names
          : params.names.map((p) => ({ name: p, count: 0 }))
      }
      header={t('specimens_overview.name')}
      onChange={(value) => setParams({ ...params, names: value })}
      values={params.names}
    />
  )
}

export default NameFacetGroup
