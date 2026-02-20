import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TEditableVolume } from '../schema/volume'
import { TEditableSpecimen } from '../schema/specimen'
import ModalContainer from './ModalContainer'
import Checkbox from '@mui/material/Checkbox'

type TProps = {
  doDuplicate: (
    fieldsToReset: (keyof TEditableVolume | keyof TEditableSpecimen)[]
  ) => Promise<void>
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const DuplicateVolumeModal: FC<TProps> = ({
  doDuplicate,
  isOpen,
  setIsOpen,
}) => {
  const { t } = useTranslation()

  const possibleFieldsToReset = [
    {
      value: 'barCode',
      label: t('specimens_overview.field_names.barcode'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: 'note',
      label: t('specimens_overview.field_names.note'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: 'mutationId',
      label: t('specimens_overview.field_names.mutation'),
      defaultChecked: false,
      disabled: false,
    },
    {
      value: 'mutationMark',
      label: t('specimens_overview.field_names.mutation_mark'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: 'damageTypes',
      label: t('specimens_overview.field_names.damage_types'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: 'damagedPages',
      label: t('specimens_overview.field_names.damaged_pages'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: 'missingPages',
      label: t('specimens_overview.field_names.missing_pages'),
      defaultChecked: true,
      disabled: false,
    },
    {
      value: 'ownerId',
      label: t('specimens_overview.field_names.owner'),
      defaultChecked: false,
      disabled: false,
    },
  ] as {
    value: keyof TEditableVolume | keyof TEditableSpecimen
    label: string
    defaultChecked: boolean
    disabled: boolean
  }[]

  const [fieldsToReset, setFieldsToReset] = useState<
    (keyof TEditableVolume | keyof TEditableSpecimen)[]
  >(possibleFieldsToReset.filter((f) => f.defaultChecked).map((f) => f.value))

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
        {possibleFieldsToReset.map((field) => (
          <Box
            key={field.value}
            sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
          >
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
        ))}
      </Box>
    </ModalContainer>
  )
}

export default DuplicateVolumeModal
