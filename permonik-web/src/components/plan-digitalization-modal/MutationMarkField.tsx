import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MutationMarkTypeEnum,
  TMutationMark,
  TMutationMarkType,
} from '../../utils/mutationMark'

type Props = {
  value: TMutationMark
  onChange: (value: TMutationMark) => void
  label: string
}

const MutationMarkField: FC<Props> = ({ value, onChange, label }) => {
  const { t } = useTranslation()

  const type = value.type ?? MutationMarkTypeEnum.MARK

  const setType = (nextType: TMutationMarkType | '') => {
    if (!nextType) {
      onChange({ mark: '', type: undefined, description: '' })
      return
    }

    if (nextType === MutationMarkTypeEnum.UNMARKED) {
      onChange({ mark: '', type: nextType, description: '' })
      return
    }

    onChange({
      mark: value.mark ?? '',
      type: nextType,
      description: value.description ?? '',
    })
  }

  return (
    <Stack spacing={1}>
      <TextField
        select
        fullWidth
        label={label}
        value={value.type ?? ''}
        onChange={(event) =>
          setType(event.target.value as TMutationMarkType | '')
        }
      >
        <MenuItem value="">{t('common.all')}</MenuItem>
        <MenuItem value={MutationMarkTypeEnum.MARK}>
          {t('volume_overview.mutation_mark_tab_symbol')}
        </MenuItem>
        <MenuItem value={MutationMarkTypeEnum.NUMBER}>
          {t('volume_overview.mutation_mark_tab_number')}
        </MenuItem>
        <MenuItem value={MutationMarkTypeEnum.UNMARKED}>
          {t('volume_overview.mutation_mark_tab_unmarked')}
        </MenuItem>
      </TextField>

      {type !== MutationMarkTypeEnum.UNMARKED ? (
        <TextField
          fullWidth
          label={t('volume_overview.mutation_mark_label_number_description')}
          value={value.mark ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              mark: event.target.value,
            })
          }
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('volume_overview.mutation_mark_unmarked_warning')}
        </Typography>
      )}

      {type === MutationMarkTypeEnum.NUMBER ? (
        <TextField
          fullWidth
          label={t('volume_overview.mutation_mark_label_number')}
          value={value.description ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              description: event.target.value,
            })
          }
        />
      ) : null}
    </Stack>
  )
}

export default MutationMarkField
