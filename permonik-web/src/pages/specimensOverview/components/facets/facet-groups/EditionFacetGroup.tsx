import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'

const EditionFacetGroup = () => {
  const { facets, disabled, params, setParams, editions, languageCode } =
    useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.editionIds.length
          ? facets.editionIds.map((m) => ({
              name: m.name,
              count: m.count,
              displayedName: editions?.find((mc) => mc.id === m.name)?.name[
                languageCode
              ],
            }))
          : params.editionIds.map((p) => ({
              name: p,
              count: 0,
              displayedName: editions?.find((mc) => mc.id === p)?.name[
                languageCode
              ],
            }))
      }
      header={t('specimens_overview.edition')}
      onChange={(value) =>
        setParams({
          ...params,
          editionIds: value,
        })
      }
      values={params.editionIds}
    />
  )
}

export default EditionFacetGroup
