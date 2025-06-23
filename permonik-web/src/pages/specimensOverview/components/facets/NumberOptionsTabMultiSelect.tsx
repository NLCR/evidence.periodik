import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { FormTabMultiSelect } from '../FormTabMultiSelect'

const NumberOptionsTabMultiSelect = () => {
  const view = useSpecimensOverviewStore((state) => state.view)
  const stateButtons = useSpecimensOverviewStore((state) => state.stateButtons)
  const setStateButtons = useSpecimensOverviewStore(
    (state) => state.setStateButtons
  )

  return view === 'table' ? (
    <FormTabMultiSelect
      selectedItems={stateButtons}
      setSelectedItems={(values) => {
        setStateButtons(values)
      }}
      label="Číslo"
      options={[
        { label: 'Číslo existuje', value: 'NUM_EXISTS' },
        { label: 'Číslo chybí', value: 'NUM_MISSING' },
      ]}
    />
  ) : null
}

export default NumberOptionsTabMultiSelect
