import { SpecimenSchema, TEditableSpecimen } from '../../../../schema/specimen'
import React, { FC, useState } from 'react'
import Box from '@mui/material/Box'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LoopIcon from '@mui/icons-material/Loop'
import { useDeleteSpecimenById } from '../../../../api/specimen'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import ModalContainer from '../../../../components/ModalContainer'
import theme from '../../../../theme'
import { GridApiCommunity } from '@mui/x-data-grid/internals'
import { useMeQuery } from '../../../../api/user'
import { useVolumeManagementStore } from '../../../../slices/useVolumeManagementStore'
import { repairOrCreateSpecimen } from '../../../../utils/specimen'
import dayjs from 'dayjs'

type DuplicationCellProps = {
  row: TEditableSpecimen
  api: GridApiCommunity
  canEdit: boolean
}

const DeletionEditCell: FC<DuplicationCellProps> = ({ row, api, canEdit }) => {
  // const { mutateAsync: doDelete, status } = useDeleteSpecimenById()
  const { t } = useTranslation()
  const me = useMeQuery()

  const [confirmDeletionModalOpened, setConfirmDeletionModalOpened] =
    useState(false)

  const deleteRow = async () => {
    const specimenValidation = SpecimenSchema.safeParse(row)

    if (!specimenValidation.success) {
      // toast.error(t('volume_overview.specimens_validation_error'))
      specimenValidation.error.errors.forEach((e) => toast.error(e.message))

      throw new Error(specimenValidation.error.message)
    }

    // prepare row update trigger option
    api.setLoading(true)
    if (api.getRowMode(row.id) === 'view') {
      console.log('startuju')
      api.startRowEditMode({ id: row.id })
    }

    while (api.getRowMode(row.id) !== 'edit') {
      // actively wait for the lifecycle update to propagate
      await new Promise((r) => setTimeout(r, 200))
    }

    // update fields that are not in the table
    api.updateRows([
      {
        ...row,
        deleted: new Date().toISOString(),
        deletedBy: me.data?.id,
      },
    ])

    // reset fields that are in the table
    if (api.getCellMode(row.id, 'numMissing') === 'edit') {
      await api.setEditCellValue({
        id: row.id,
        field: 'numMissing',
        value: false,
      })
    }
    if (api.getCellMode(row.id, 'numExists') === 'edit') {
      await api.setEditCellValue({
        id: row.id,
        field: 'numExists',
        value: false,
      })
    }

    // trigger row update lifecycle hook - commit the edits to trigger processRowUpdate
    if (api.getRowMode(row.id) === 'edit') {
      console.log('stopuju')
      api.stopRowEditMode({ id: row.id })
    }
    api.setLoading(false)

    // delete also on BE
    // try {
    //   await doDelete({ volumeId: row.volumeId, specimenId: row.id })
    // } catch (e) {
    //   console.log(e)
    // }
    toast.success(t('volume_overview.specimen_deleted_successfully'))
  }

  // TODO: color grey when cannot edit
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {row.created ? (
        <>
          {/* {status === 'pending' ? (
            <LoopIcon
              sx={{
                animation: 'spin 0.5s linear infinite',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(360deg)',
                  },
                  '100%': {
                    transform: 'rotate(0deg)',
                  },
                },
              }}
            />
          ) : ( */}
          <DeleteOutlineIcon
            onClick={() =>
              canEdit ? setConfirmDeletionModalOpened(true) : null
            }
            sx={{
              cursor: 'pointer',
              color: canEdit
                ? theme.palette.grey[900]
                : theme.palette.grey[600],
            }}
          />
          {/* )} */}
          <ModalContainer
            onClose={() => setConfirmDeletionModalOpened(false)}
            header={t('volume_overview.delete_specimen_text')}
            opened={confirmDeletionModalOpened}
            acceptButton={{
              callback: () => {
                setConfirmDeletionModalOpened(false)
                deleteRow()
              },
            }}
            closeButton={{
              callback: () => setConfirmDeletionModalOpened(false),
            }}
            style="fitted"
          />
        </>
      ) : null}
    </Box>
  )
}

export default DeletionEditCell
