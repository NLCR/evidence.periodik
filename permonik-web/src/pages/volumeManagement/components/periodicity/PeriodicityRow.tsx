import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { t } from 'i18next'
import { TVolumePeriodicityDays } from '../../../../schema/volume'
import InputDataAutocomplete from '../inputData/InputDataAutocomplete'
import InputDataCheckbox from '../inputData/InputDataCheckbox'
import InputDataSelect from '../inputData/InputDataSelect'
import InputDataTextField from '../inputData/InputDataTextField'
import {
  FieldValues,
  UseFieldArrayInsert,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import useSortedSpecimensNamesAndSubNames from '../../../../hooks/useSortedSpecimensNamesAndSubNames'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'
import { useInputDataEditabilityContext } from '../inputData/InputDataEditabilityContextProvider'
import { TEdition } from '../../../../schema/edition'

type Props = {
  p: { id: string }
  index: number
  insert: UseFieldArrayInsert<FieldValues, 'periodicity'>
  remove: UseFieldArrayRemove
  editions: TEdition[]
}

const PeriodicityRow = ({ p, index, insert, remove, editions }: Props) => {
  const { watch, getValues } = useFormContext()

  const disabledRow = !watch(`periodicity.${index}.numExists`)
  const { disabled, locked } = useInputDataEditabilityContext()

  const { names, subNames } = useSortedSpecimensNamesAndSubNames()
  const { languageCode } = useLanguageCode()

  return (
    <TableRow>
      <TableCell>
        {t(
          `volume_overview.days.${getValues(`periodicity.${index}.day`) as TVolumePeriodicityDays}`
        )}
      </TableCell>
      <TableCell>
        <InputDataCheckbox name={`periodicity.${index}.numExists`} />
      </TableCell>
      <TableCell>
        <InputDataSelect
          name={`periodicity.${index}.editionId`}
          disabled={disabledRow}
          options={editions.map((o) => ({
            key: o.id,
            value: o.name[languageCode],
          }))}
        />
      </TableCell>
      <TableCell>
        <InputDataTextField
          name={`periodicity.${index}.pagesCount`}
          disabled={disabledRow}
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <InputDataAutocomplete
          name={`periodicity.${index}.name`}
          disabled={disabledRow}
          options={names}
        />
      </TableCell>
      <TableCell>
        <InputDataAutocomplete
          name={`periodicity.${index}.subName`}
          disabled={disabledRow}
          options={subNames}
        />
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {getValues(`periodicity.${index}.duplicated`) ? (
            <IconButton disabled={disabled || locked || disabledRow}>
              <DeleteOutlineIcon
                onClick={() => remove(index)}
                sx={{
                  cursor: 'pointer',
                }}
              />
            </IconButton>
          ) : (
            <IconButton disabled={disabled || locked || disabledRow}>
              <AddCircleOutlineIcon
                onClick={() =>
                  insert(index + 1, { ...p, duplicated: true }, {})
                }
                sx={{
                  cursor: 'pointer',
                }}
              />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default PeriodicityRow
