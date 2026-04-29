import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Control, Controller } from 'react-hook-form'
import { TFunction } from 'i18next'
import { TTemplate } from '@/components/prepare-scan-modal/schemas/schemas'

type Props = {
  control: Control<TTemplate>
  itemPath: `items.${number}`
  t: TFunction
  disabled: boolean
}

const SpecimenNoteField = ({ control, itemPath, t, disabled }: Props) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography>
      {t('prepare_scan_modal.content_template.note_label')}
    </Typography>
    <Controller
      control={control}
      name={`${itemPath}.note`}
      render={({ field }) => (
        <TextField
          variant="standard"
          fullWidth
          value={field.value ?? ''}
          onChange={(event) => field.onChange(event.target.value)}
          disabled={disabled}
        />
      )}
    />
  </Stack>
)

export default SpecimenNoteField
