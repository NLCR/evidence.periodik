import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import { mapTintToColor } from './utils/tint'
import InputDataMutationMarkField from './InputDataMutationMarkField'

const InputDataMutationMark = () => {
  const { watch } = useFormContext()
  const isDuplicated = location.href.includes('duplicated')
  const isEmpty = !watch('mutationMark') && !watch('mutationMarkNumber')
  const { t } = useTranslation()

  return (
    <TableRow
      sx={{
        backgroundColor: mapTintToColor(
          isDuplicated && isEmpty ? 'warning' : 'default'
        ),
      }}
    >
      <TableCell>{t('specimens_overview.mutation_mark')}</TableCell>
      <TableCell>
        <InputDataMutationMarkField />
      </TableCell>
    </TableRow>
  )
}

export default InputDataMutationMark
