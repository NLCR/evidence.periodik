import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'
import { TSpecimenDamageTypes } from '../../../../../schema/specimen'

const DamageTypeFacetGroup = () => {
  const { facets, disabled, params, setParams } = useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.damageTypes.length
          ? facets.damageTypes.map((m) => ({
              name: m.name,
              count: m.count,
              displayedName: t(`facet_states.${m.name}`),
            }))
          : params.damageTypes.map((p) => ({
              name: p,
              count: 0,
              displayedName: t(`facet_states.${p as TSpecimenDamageTypes}`),
            }))
      }
      header={t('specimens_overview.damage_types')}
      onChange={(value) =>
        setParams({
          ...params,
          damageTypes: value,
        })
      }
      values={params.damageTypes}
    />
  )
}

export default DamageTypeFacetGroup
