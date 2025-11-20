import { SpecimenStateEnum, TSpecimenState } from '../../../../schema/specimen'
import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { FormTabMultiSelect } from '../FormTabMultiSelect'

const NumberOptionsTabMultiSelect = () => {
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
      label="Číslo"
      options={[
        { label: 'Číslo existuje', value: SpecimenStateEnum.numExists },
        { label: 'Číslo chybí', value: SpecimenStateEnum.numMissing },
      ]}
    />
  ) : null
}

export default NumberOptionsTabMultiSelect
