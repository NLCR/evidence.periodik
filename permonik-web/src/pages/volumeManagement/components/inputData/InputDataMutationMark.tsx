import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { mapTintToColor } from './utils/tint'
import InputDataMutationMarkField from './InputDataMutationMarkField'
undefined

const InputDataMutationMark = () => {
  const { watch } = useFormContext()
  const isDuplicated = location.href.includes('duplicated')
  const isEmpty = !hasMutationMark(watch('mutationMark'))
  const { t } = useTranslation()

  return (
    <TableRow
      sx={{
        backgroundColor: mapTintToColor(
          isDuplicated && isEmpty ? 'warning' : 'default'
        ),
      }}
    >
      <TableCell>{t('common.fields.mutation_mark')}</TableCell>
      <TableCell>
        <InputDataMutationMarkField />
      </TableCell>
    </TableRow>
  )
}

export default InputDataMutationMark
