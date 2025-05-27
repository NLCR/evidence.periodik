import FacetGroup from '../FacetGroup'
import { t } from 'i18next'
import { useFacetsContext } from '../FacetsContext'

const MutationMarkFacetGroup = () => {
  const { facets, disabled, params, setParams } = useFacetsContext()
  return (
    <FacetGroup
      disabled={disabled}
      facets={
        facets?.mutationMarks.length
          ? facets.mutationMarks
          : params.mutationMarks.map((p) => ({ name: p, count: 0 }))
      }
      header={t('specimens_overview.mutation_mark')}
      onChange={(value) =>
        setParams({
          ...params,
          mutationMarks: value,
        })
      }
      values={params.mutationMarks}
    />
  )
}

export default MutationMarkFacetGroup
