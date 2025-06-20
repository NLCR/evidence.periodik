import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { FormTabMultiSelect } from '../FormTabMultiSelect'

const NumberOptionsTabMultiSelect = () => {
  const view = useSpecimensOverviewStore((state) => state.view)
  const params = useSpecimensOverviewStore((state) => state.params)
  const setParams = useSpecimensOverviewStore((state) => state.setParams)

  return view === 'table' ? (
    <FormTabMultiSelect
      selectedItems={params.numberOptions}
      setSelectedItems={(value: string[]) =>
        setParams({ ...params, numberOptions: value })
      }
      label="Číslo"
      options={[
        { label: 'Číslo existuje', value: 'numExists' },
        { label: 'Číslo chybí', value: 'numMissing' },
      ]}
    />
  ) : null
}

export default NumberOptionsTabMultiSelect
