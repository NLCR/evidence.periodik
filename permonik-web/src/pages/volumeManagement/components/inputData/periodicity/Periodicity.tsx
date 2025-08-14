/* eslint-disable no-nested-ternary */
import { FC, useMemo, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { TEdition } from '../../../../../schema/edition'
import ModalContainer from '../../../../../components/ModalContainer'
import InputDataCheckbox from '../InputDataCheckbox'
import { useInputDataEditabilityContext } from '../InputDataEditabilityContextProvider'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useGenerateVolume } from './useGenerateVolume'
import PeriodicityRow from './PeriodicityRow'
import { TMetaTitle } from '../../../../../schema/metaTitle'

interface PeriodicityProps {
  editions: TEdition[]
  metaTitles: TMetaTitle[]
}

const Periodicity: FC<PeriodicityProps> = ({ editions, metaTitles }) => {
  const [periodicityModalVisible, setPeriodicityModalVisible] = useState(false)
  const { t } = useTranslation()

  const { disabled, locked, setLocked } = useInputDataEditabilityContext()
  const { control, watch } = useFormContext()

  const metatitleId = watch('metaTitleId')
  const metaTitle = useMemo(
    () => metaTitles.find((value) => value.id === metatitleId)?.name,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(metaTitles.map((metatitle) => metatitle.id)), metatitleId]
  )

  const { fields, remove, insert } = useFieldArray({
    control,
    name: 'periodicity',
  })

  const generateVolume = useGenerateVolume(editions, setPeriodicityModalVisible)

  return (
    <>
      <Button
        // disabled={!canEdit}
        variant="contained"
        fullWidth
        onClick={() => setPeriodicityModalVisible(true)}
      >
        {t('volume_overview.edit_periodicity')}
      </Button>
      <ModalContainer
        header={t('volume_overview.periodicity')}
        opened={periodicityModalVisible}
        onClose={() => setPeriodicityModalVisible(false)}
        closeButton={{
          callback: () => setPeriodicityModalVisible(false),
        }}
        acceptButton={{
          callback: () => {
            if (generateVolume()) {
              setLocked(true)
            }
          },
          text: t('volume_overview.generate_volume'),
          disabled: disabled || locked,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('volume_overview.releasing')}</TableCell>
              <TableCell>{t('volume_overview.is_in_volume')}</TableCell>
              <TableCell>{t('volume_overview.edition')}</TableCell>
              <TableCell>{t('volume_overview.pages_count')}</TableCell>
              <TableCell>{t('volume_overview.name')}</TableCell>
              <TableCell>{t('volume_overview.sub_name')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((p, index) => (
              <PeriodicityRow
                key={p.id}
                editions={editions}
                index={index}
                insert={insert}
                remove={remove}
                metaTitle={metaTitle}
              />
            ))}
          </TableBody>
        </Table>
        <Box
          sx={{
            marginTop: '10px',
          }}
        >
          <InputDataCheckbox
            name={`showAttachmentsAtTheEnd`}
            label={t('volume_overview.show_attachments_at_the_end')}
          />
        </Box>
      </ModalContainer>
    </>
  )
}

export default Periodicity
