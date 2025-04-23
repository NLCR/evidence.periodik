import { GridRenderEditCellParams } from '@mui/x-data-grid/models/params/gridCellParams'
import React, { ChangeEvent } from 'react'
import Checkbox from '@mui/material/Checkbox'
import {
  TEditableSpecimen,
  TSpecimenDamageTypes,
} from '../../../../schema/specimen'

const DamageTypesEditCell = (
  props: GridRenderEditCellParams<TEditableSpecimen>
) => {
  const { field, row, api } = props

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    const currentDamageTypes = row.damageTypes || []

    const newDamageTypes = isChecked
      ? [...currentDamageTypes, field as TSpecimenDamageTypes]
      : currentDamageTypes.filter((dt) => dt !== field)

    const updatedRow = { ...row, damageTypes: newDamageTypes }
    api.updateRows([updatedRow])
  }

  return (
    <Checkbox
      color={field === 'OK' ? 'success' : 'primary'}
      onChange={handleChange}
      checked={!!row.damageTypes?.some((dt) => dt === field)}
    />
  )
}

export default DamageTypesEditCell
