import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import React, { FC, RefObject, useState } from 'react'
import clone from 'lodash/clone'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { TEditableSpecimen } from '../../../../schema/specimen'
import ModalContainer from '../../../../components/ModalContainer'
import Box from '@mui/material/Box'
import {
  GridApiPro,
  gridExpandedSortedRowEntriesSelector,
} from '@mui/x-data-grid-pro'

type RenumberableValueCellProps = {
  row: TEditableSpecimen
  show: boolean
  canEdit: boolean
  type: 'number' | 'attachmentNumber'
  apiRef: RefObject<GridApiPro | null>
}

const RenumberableValueCell: FC<RenumberableValueCellProps> = ({
  row,
  show,
  canEdit,
  type,
  apiRef,
}) => {
  const { t } = useTranslation()

  const specimensActions = useVolumeManagementStore(
    (state) => state.specimensActions
  )
  const [modalOpened, setModalOpened] = useState(false)

  const getWillBeRenumbered = (renumberType: 'number' | 'attachmentNumber') => {
    const filteredSpecimens = gridExpandedSortedRowEntriesSelector(apiRef).map(
      (row) => row.model
    ) as TEditableSpecimen[]
    const specimenIndex = filteredSpecimens.findIndex((sp) => sp.id === row.id)
    const max = filteredSpecimens.length
    let willBeRenumbered = 0
    const editionId = row.editionId
    const title = row.name

    for (let i = specimenIndex; i < max; i += 1) {
      if (filteredSpecimens[i]) {
        if (filteredSpecimens[i].numExists || filteredSpecimens[i].numMissing) {
          if (renumberType === 'number' && !filteredSpecimens[i].isAttachment) {
            willBeRenumbered += 1
          }
          if (
            renumberType === 'attachmentNumber' &&
            filteredSpecimens[i].isAttachment &&
            filteredSpecimens[i].editionId === editionId && // renumber only same editions
            filteredSpecimens[i].name === title // renumber only same titled editions
          ) {
            willBeRenumbered += 1
          }
        }
      }
    }

    return willBeRenumbered
  }

  const doRenumber = (renumberType: 'number' | 'attachmentNumber') => {
    const filteredSpecimens = gridExpandedSortedRowEntriesSelector(apiRef).map(
      (row) => row.model
    ) as TEditableSpecimen[]
    const specimenIndex = filteredSpecimens.findIndex((sp) => sp.id === row.id)
    const max = filteredSpecimens.length
    let firstNumber = -1
    let currentNumber =
      renumberType === 'number'
        ? Number(filteredSpecimens[specimenIndex].number || 0)
        : Number(filteredSpecimens[specimenIndex].attachmentNumber || 0)
    const willBeRenumbered = getWillBeRenumbered(renumberType)
    const editionId = row.editionId
    const title = row.name

    const specimensClone = clone(filteredSpecimens)

    for (let i = specimenIndex; i < max; i += 1) {
      if (filteredSpecimens[i].numExists || filteredSpecimens[i].numMissing) {
        if (firstNumber < 0) {
          firstNumber = currentNumber
        }
        if (renumberType === 'number' && !filteredSpecimens[i].isAttachment) {
          specimensClone[i] = {
            ...specimensClone[i],
            number: currentNumber.toString(),
          }
          currentNumber += 1
        }
        if (
          renumberType === 'attachmentNumber' &&
          filteredSpecimens[i].isAttachment &&
          filteredSpecimens[i].editionId === editionId &&
          filteredSpecimens[i].name === title // renumber only same titled editions
        ) {
          specimensClone[i] = {
            ...specimensClone[i],
            attachmentNumber: currentNumber.toString(),
          }
          currentNumber += 1
        }
      }
    }

    specimensActions.setSpecimensById(specimensClone)
    toast.success(
      t('volume_overview.renumbered_correctly', {
        willBeRenumbered,
        firstNumber,
        lastNumber: currentNumber - 1,
      })
    )
  }

  return show ? (
    <>
      <Box
        sx={(theme) => ({
          color: canEdit ? theme.palette.grey[900] : theme.palette.grey[600],
        })}
      >
        {type === 'number' ? row.number : row.attachmentNumber}
        {row.numExists ? (
          <IconButton
            color="primary"
            disabled={!canEdit}
            onClick={() => setModalOpened(true)}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        ) : null}
      </Box>
      <ModalContainer
        header={t('volume_overview.renumber_header')}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        acceptButton={{
          callback: () => {
            setModalOpened(false)
            doRenumber(type)
          },
          disabled: !canEdit,
          text: t('volume_overview.do_renumber'),
        }}
        closeButton={{ callback: () => setModalOpened(false) }}
        style="fitted"
      >
        <Typography
          sx={{
            marginBottom: '5px',
            fontWeight: '600',
          }}
        >
          {t('volume_overview.renumber_text', {
            value: getWillBeRenumbered(type),
          })}
        </Typography>
      </ModalContainer>
    </>
  ) : null
}

// RenumberableValueCell.whyDidYouRender = true

export default RenumberableValueCell
