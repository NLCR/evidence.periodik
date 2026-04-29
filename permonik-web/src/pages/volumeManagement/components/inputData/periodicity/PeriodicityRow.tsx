import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { t } from 'i18next'
import { TVolumePeriodicityDays } from '../../../../../schema/volume'
import InputDataAutocomplete from '../InputDataAutocomplete'
import InputDataCheckbox from '../InputDataCheckbox'
import InputDataSelect from '../InputDataSelect'
import InputDataTextField from '../InputDataTextField'
import {
  FieldValues,
  UseFieldArrayInsert,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import useSortedSpecimensNamesAndSubNames from '../../../../../hooks/useSortedSpecimensNamesAndSubNames'
import { useLanguageCode } from '../../../../../hooks/useLanguageCode'
import { useInputDataEditabilityContext } from '../InputDataEditabilityContextProvider'
import { TEdition } from '../../../../../schema/edition'

type Props = {
  index: number
  insert: UseFieldArrayInsert<FieldValues, 'periodicity'>
  remove: UseFieldArrayRemove
  editions: TEdition[]
  metaTitle: string | null | undefined
}

const PeriodicityRow = ({
  index,
  insert,
  remove,
  editions,
  metaTitle,
}: Props) => {
  const { watch, getValues, resetField, setValue } = useFormContext()
  const { disabled, locked } = useInputDataEditabilityContext()
  const { names, subNames } = useSortedSpecimensNamesAndSubNames()
  const { languageCode } = useLanguageCode()

  // The attachment must be a duplicated line as there cannot be an attachment without its specimen
  const canBeAttachment = getValues(`periodicity.${index}.duplicated`)

  const disabledRow = !watch(`periodicity.${index}.numExists`)
  const subname = watch('subName')

  return (
    <TableRow>
      <TableCell>
        {t(
          `volume_overview.days.${getValues(`periodicity.${index}.day`) as TVolumePeriodicityDays}`
        )}
      </TableCell>
      <TableCell>
        <InputDataCheckbox
          name={`periodicity.${index}.numExists`}
          onChangeCallback={(value: boolean) => {
            if (value) {
              setValue(`periodicity.${index}.name`, metaTitle)
              setValue(`periodicity.${index}.subName`, subname)
            } else {
              resetField(`periodicity.${index}.editionId`)
              resetField(`periodicity.${index}.pagesCount`)
              resetField(`periodicity.${index}.name`)
              resetField(`periodicity.${index}.subName`)
            }
          }}
        />
      </TableCell>
      <TableCell>
        <InputDataSelect
          name={`periodicity.${index}.editionId`}
          disabled={disabledRow}
          options={editions
            .filter((o) => (canBeAttachment ? true : !o.isAttachment))
            .map((o) => ({
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
            <IconButton disabled={disabled || locked}>
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
                  insert(
                    index + 1,
                    { ...getValues(`periodicity.${index}`), duplicated: true },
                    {}
                  )
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
