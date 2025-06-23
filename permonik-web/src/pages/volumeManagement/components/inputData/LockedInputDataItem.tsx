import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import ConfirmDialog from '../../../specimensOverview/components/dialogs/ConfirmDialog'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string | undefined
  editable?: boolean
  saveChange?: () => void
}

const LockedInputDataItem = ({
  value,
  editable = false,
  saveChange = undefined,
}: Props) => {
  if (editable && !saveChange) {
    throw new Error(
      'saveChange must be filled if the LockedInputDataItem is marked as editable'
    )
  }

  const { t } = useTranslation()

  return (
    <Box sx={{ marginY: 1, display: 'flex', justifyContent: 'space-between' }}>
      {value ?? '-'}
      {editable && (
        <>
          <ConfirmDialog
            title={t('volume_overview.')}
            description={
              <Box>
                <Box>tady bude ta editacni vec</Box>
                {t('volume_overview.')}
              </Box>
            }
            onConfirm={() => {
              //TODO
            }}
            TriggerButton={
              <IconButton>
                <EditIcon />
              </IconButton>
            }
          />
        </>
      )}
    </Box>
  )
}

export default LockedInputDataItem
