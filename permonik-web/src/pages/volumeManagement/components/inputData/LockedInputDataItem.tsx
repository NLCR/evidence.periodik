import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import ConfirmDialog from '../../../specimensOverview/components/dialogs/ConfirmDialog'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'

type Props = {
  name: string
  editableData?: {
    DialogContent: ReactElement
    fieldName: string
    saveChange: (value: string) => void
  }
  type?: 'TEXT' | 'DATE' | 'NUMBER' | 'SELECT'
  selectOptions?: { key: string; value: string }[]
}

const LockedInputDataItem = ({
  name,
  editableData = undefined,
  type = 'TEXT',
  selectOptions = undefined,
}: Props) => {
  const { t } = useTranslation()
  const { getValues, watch } = useFormContext()
  const value = watch(name)

  if (type === 'SELECT' && !selectOptions) {
    throw new Error('Type SELECT must have selectOptions filled')
  }

  return (
    <Box sx={{ marginY: 1, display: 'flex', justifyContent: 'space-between' }}>
      {value
        ? type === 'DATE'
          ? dayjs(value).format('DD. MM. YYYY')
          : type === 'SELECT'
            ? selectOptions?.find((option) => option.key === value)?.value
            : value
        : '-'}
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
              editableData.saveChange(getValues(name))
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
