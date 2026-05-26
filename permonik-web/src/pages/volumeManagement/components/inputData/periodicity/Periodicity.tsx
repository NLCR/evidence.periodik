import { type FC, useMemo, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { type TEdition } from '../../../../../schema/edition'
import ModalContainer from '../../../../../components/ModalContainer'
import InputDataSelect from '../InputDataSelect'
import { useInputDataEditabilityContext } from '../InputDataEditabilityContextProvider'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { useGenerateVolume } from './useGenerateVolume'
import PeriodicityRow from './PeriodicityRow'
import { type TMetaTitle } from '../../../../../schema/metaTitle'
import theme from '../../../../../theme'
import { Typography } from '@mui/material'

interface PeriodicityProps {
  editions: TEdition[]
  metaTitles: TMetaTitle[]
}

const Periodicity: FC<PeriodicityProps> = ({ editions, metaTitles }) => {
  const [periodicityModalVisible, setPeriodicityModalVisible] = useState(false)
  const { t } = useTranslation()

  const { disabled, locked, setLocked } = useInputDataEditabilityContext()
  const { control } = useFormContext()

  const metatitleId = useWatch({ name: 'metaTitleId', control })
  const metaTitle = useMemo(
    () => metaTitles.find((value) => value.id === metatitleId)?.name,
    [metaTitles, metatitleId] // metatitles is reference-stable array from useQuery
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
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-start',
            width: 'fit-content',
          }}
        >
          <Typography
            sx={{
              color: theme.palette.primary.main,
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {t('volume_overview.attachments_sort')}
          </Typography>
          <InputDataSelect
            name="attachmentsSort"
            options={[
              {
                key: 'ASC',
                value: t('volume_overview.attachments_sort_asc'),
              },
              {
                key: 'DESC',
                value: t('volume_overview.attachments_sort_desc'),
              },
              {
                key: 'NONE',
                value: t('volume_overview.attachments_sort_none'),
              },
            ]}
          />
        </Box>
      </ModalContainer>
    </>
  )
}

export default Periodicity
