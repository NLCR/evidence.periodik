import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import ConfirmDialog from '../../../specimensOverview/components/dialogs/ConfirmDialog'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'react'

type Props = {
  value: string | undefined
  editableData?: {
    DialogContent: ReactElement
    fieldName: string
    saveChange: () => void
  }
}

const LockedInputDataItem = ({ value, editableData = undefined }: Props) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ marginY: 1, display: 'flex', justifyContent: 'space-between' }}>
      {value ?? '-'}
      {editableData && (
        <>
          <ConfirmDialog
            title={
              t('volume_overview.editing_dialog_title') +
              ': ' +
              editableData.fieldName
            }
            description={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'start',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {editableData.DialogContent}
                {t('volume_overview.editing_dialog_description')}
              </Box>
            }
            onConfirm={() => {
              editableData.saveChange()
            }}
            TriggerButton={
              <IconButton sx={{ marginY: -1 }}>
                <EditIcon />
              </IconButton>
            }
            confirmLabel={t('volume_overview.editing_dialog_yes')}
            refuseLabel={t('volume_overview.editing_dialog_no')}
          />
        </>
      )}
    </Box>
  )
}

export default LockedInputDataItem
