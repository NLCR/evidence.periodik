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

type DuplicationCellProps = {
  row: TEditableSpecimen
  canEdit: boolean
}

const DeletionEditCell: FC<DuplicationCellProps> = ({ row, canEdit }) => {
  const { mutateAsync: doDelete, status } = useDeleteSpecimenById()
  const { t } = useTranslation()

  const [confirmDeletionModalOpened, setConfirmDeletionModalOpened] =
    useState(false)

  const deleteRow = async () => {
    const specimenValidation = SpecimenSchema.safeParse(row)

    if (!specimenValidation.success) {
      // toast.error(t('volume_overview.specimens_validation_error'))
      specimenValidation.error.errors.forEach((e) => toast.error(e.message))

      throw new Error(specimenValidation.error.message)
    }

    try {
      await doDelete({ volumeId: row.volumeId, specimenId: row.id })

      toast.success(t('volume_overview.specimen_deleted_successfully'))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error(t('volume_overview.specimen_delete_error'))
    }
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
          {status === 'pending' ? (
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
          ) : (
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
          )}
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
