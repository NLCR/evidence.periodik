import Box from '@mui/material/Box'
import React, { FC, RefObject } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import IconButton from '@mui/material/IconButton'
import clone from 'lodash/clone'
import {
  TEditableSpecimen,
  TSpecimenDamageTypes,
} from '../../../../schema/specimen'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import {
  GridApiPro,
  gridExpandedSortedRowEntriesSelector,
} from '@mui/x-data-grid-pro'
import Tooltip from '@mui/material/Tooltip'

type HeaderWithColumnActionProps = {
  field: TSpecimenDamageTypes
  canEdit: boolean
  apiRef: RefObject<GridApiPro | null>
  headerName: string
  description: string
}

const HeaderWithColumnAction: FC<HeaderWithColumnActionProps> = ({
  field,
  canEdit,
  apiRef,
  headerName,
  description,
}) => {
  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )

  const handleDamageChange = () => {
    const filteredSpecimens = gridExpandedSortedRowEntriesSelector(apiRef).map(
      (row) => row.model
    ) as TEditableSpecimen[]
    let specimensClone = clone(filteredSpecimens)
    const specimensWithSelectedDamage = specimensClone.filter(
      (sp) => sp.numExists && sp.damageTypes?.includes(field)
    ).length
    const specimensThatExists = specimensClone.filter(
      (sp) => sp.numExists
    ).length

    if (
      !specimensWithSelectedDamage ||
      specimensWithSelectedDamage !== specimensThatExists
    ) {
      specimensClone = specimensClone.map((sp) => {
        if (sp.numExists) {
          const damageTypes = new Set(sp.damageTypes)
          damageTypes.add(field)
          return {
            ...sp,
            damageTypes: Array.from(damageTypes),
          }
        }
        return sp
      })
    } else {
      specimensClone = specimensClone.map((sp) => {
        if (sp.numExists) {
          const damageTypes = new Set(sp.damageTypes)
          damageTypes.delete(field)
          return {
            ...sp,
            damageTypes: Array.from(damageTypes),
          }
        }
        return sp
      })
    }

    specimensActions.setSpecimensById(specimensClone)
  }

  const doAction = () => {
    switch (field) {
      case 'OK':
        handleDamageChange()
        break
      case 'Deg':
        handleDamageChange()
        break
      case 'NS':
        handleDamageChange()
        break

      default:
    }
  }

  return (
    <Tooltip title={description} placement="bottom">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box dangerouslySetInnerHTML={{ __html: headerName }} />
        <IconButton
          color="primary"
          disabled={!canEdit}
          onClick={() => doAction()}
          sx={{
            padding: 0,
          }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>
    </Tooltip>
  )
}

// HeaderWithColumnAction.whyDidYouRender = true

export default HeaderWithColumnAction
