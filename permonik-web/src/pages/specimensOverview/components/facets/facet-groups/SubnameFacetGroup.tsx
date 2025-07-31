import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'

const SubnameFacetGroup = () => {
  const { facets, disabled, params, setParams } = useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.subNames.length
          ? facets.subNames
          : params.subNames.map((p) => ({ name: p, count: 0 }))
      }
      header={t('specimens_overview.sub_name')}
      onChange={(value) => setParams({ ...params, subNames: value })}
      values={params.subNames}
    />
  )
}

export default SubnameFacetGroup
