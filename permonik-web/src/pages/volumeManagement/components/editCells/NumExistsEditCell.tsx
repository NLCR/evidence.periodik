import { GridRenderEditCellParams } from '@mui/x-data-grid/models/params/gridCellParams'
import { ChangeEvent } from 'react'
import Checkbox from '@mui/material/Checkbox'
import { TEditableSpecimen } from '../../../../schema/specimen'

const NumExistsEditCell = (
  props: GridRenderEditCellParams<TEditableSpecimen>
) => {
  const { id, field, row, api } = props

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    api.setEditCellValue({ id: id, field, value: isChecked }, event)
    // trigger row update lifecycle hook
    api.setLoading(true)
    api.stopRowEditMode({ id: row.id })
    while (api.getRowMode(row.id) === 'edit') {
      await new Promise((r) => setTimeout(r, 200))
    }
    api.startRowEditMode({ id: row.id })
    api.setLoading(false)
  }

  return (
    <Checkbox
      color={'primary'}
      onChange={handleChange}
      checked={row.numExists}
    />
  )
}

export default NumExistsEditCell
