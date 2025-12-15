import { useTranslation } from 'react-i18next'
import { SpecimenStateEnum, TSpecimenState } from '../../../../schema/specimen'
import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { FormTabMultiSelect } from '../FormTabMultiSelect'

const NumberOptionsTabMultiSelect = () => {
  const { t } = useTranslation()
  const view = useSpecimensOverviewStore((state) => state.view)
  const specimenStates = useSpecimensOverviewStore(
    (state) => state.specimenStates
  )
  const setSpecimenStates = useSpecimensOverviewStore(
    (state) => state.setSpecimenStates
  )

  return view === 'TABLE' ? (
    <FormTabMultiSelect
      selectedItems={specimenStates}
      setSelectedItems={(values) =>
        setSpecimenStates(values as TSpecimenState[])
      }
      label={t('boolean_facet_states.title')}
      options={[
        {
          label: t('boolean_facet_states.numExists'),
          value: SpecimenStateEnum.numExists,
        },
        {
          label: t('boolean_facet_states.numMissing'),
          value: SpecimenStateEnum.numMissing,
        },
      ]}
    />
  ) : null
}

export default NumberOptionsTabMultiSelect
