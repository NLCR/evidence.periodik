import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ModalContainer from './ModalContainer'
import Checkbox from '@mui/material/Checkbox'
import { FieldsToReset } from '../utils/duplicateVolume/types'
import Grid from '@mui/material/Grid'

type TProps = {
  doDuplicate: (fieldsToReset: FieldsToReset[]) => Promise<void>
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const DuplicateVolumeModal: FC<TProps> = ({
  doDuplicate,
  isOpen,
  setIsOpen,
}) => {
  const { t } = useTranslation()

  const possibleFieldsToReset: {
    value: FieldsToReset
    label: string
    defaultChecked: boolean
    disabled: boolean
  }[] = [
    {
      value: FieldsToReset.barCode,
      label: t('specimens_overview.field_names.barcode'),
      defaultChecked: true,
      disabled: true,
    },
    {
      value: FieldsToReset.signature,
      label: t('specimens_overview.field_names.signature'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: FieldsToReset.note,
      label: t('specimens_overview.field_names.note'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: FieldsToReset.mutationId,
      label: t('specimens_overview.field_names.mutation'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.mutationMark,
      label: t('specimens_overview.field_names.mutation_mark'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: FieldsToReset.ownerId,
      label: t('specimens_overview.field_names.owner'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.damagedPages,
      label: t('specimens_overview.field_names.damaged_pages'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: FieldsToReset.missingPages,
      label: t('specimens_overview.field_names.missing_pages'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: FieldsToReset.missingNumber,
      label: t('specimens_overview.field_names.missing_number'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.degradation,
      label: t('specimens_overview.field_names.degradation'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.wrongPagination,
      label: t('specimens_overview.field_names.wrong_pagination'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.wrongNumbering,
      label: t('specimens_overview.field_names.wrong_numbering'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.wrongBinding,
      label: t('specimens_overview.field_names.wrong_binding'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.censored,
      label: t('specimens_overview.field_names.censored'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: FieldsToReset.unreadableBinding,
      label: t('specimens_overview.field_names.unreadable_binding'),
      defaultChecked: false,
      disabled: false,
    },
    // {
    //   value: FieldsToReset.censoredVersion,
    //   label: t('specimens_overview.field_names.censored_version'),
    //   defaultChecked: false,
    //   disabled: false,
    // },
    {
      value: FieldsToReset.wrongDate,
      label: t('specimens_overview.field_names.wrong_date'),
      defaultChecked: false,
      disabled: false,
    },
  ]

  const [fieldsToReset, setFieldsToReset] = useState<FieldsToReset[]>(
    possibleFieldsToReset.filter((f) => f.defaultChecked).map((f) => f.value)
  )

  return (
    <ModalContainer
      autoWidth
      minWidth="30rem"
      header={t('specimens_overview.duplicate_volume_modal_header')}
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      closeButton={{ callback: () => setIsOpen(false) }}
      acceptButton={{
        callback: async () => {
          await doDuplicate(fieldsToReset)
          setIsOpen(false)
        },
      }}
    >
      <Box>
        <Typography
          variant="body1"
          mb={2}
          style={{ whiteSpace: 'pre-wrap', fontWeight: '600' }}
        >
          {t('specimens_overview.duplicate_volume_modal_description1')}
        </Typography>
        <Typography variant="body1" mb={2} style={{ whiteSpace: 'pre-wrap' }}>
          {t('specimens_overview.duplicate_volume_modal_description2')}
        </Typography>
        <Grid container spacing={2} mb={2}>
          {possibleFieldsToReset.map((field) => (
            <Grid size={6} key={field.value}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Checkbox
                  checked={fieldsToReset.includes(field.value)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setFieldsToReset([...fieldsToReset, field.value])
                    } else {
                      setFieldsToReset(
                        fieldsToReset.filter((f) => f !== field.value)
                      )
                    }
                  }}
                  disabled={field.disabled}
                />
                <Typography>{field.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ModalContainer>
  )
}

export default DuplicateVolumeModal
