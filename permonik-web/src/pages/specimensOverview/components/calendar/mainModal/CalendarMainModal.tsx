import Box from '@mui/material/Box'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'
import React, { Dispatch, SetStateAction, useState } from 'react'
import ModalContainer from '../../../../../components/ModalContainer'
import Table from '@mui/material/Table'
import { TMainModalData } from '../models'
import { useEditionListQuery } from '../../../../../api/edition'
import { useOwnerListQuery } from '../../../../../api/owner'
import { TSpecimen } from '../../../../../schema/specimen'
import { useTranslation } from 'react-i18next'
import { TMetaTitle } from '../../../../../schema/metaTitle'
import CalendarSubModal from '../CalendarSubModal'
import { TMutation } from '../../../../../schema/mutation'
import CalendarMainModalTableHead from './CalendarMainModalTableHead'
import CalendarMainModalTableRow from './CalendarMainModalTableRow'
import { useFormatDate } from '../../../../../utils/date'

type Props = {
  mainModalData: TMainModalData
  setMainModalData: Dispatch<SetStateAction<TMainModalData>>
  metaTitle: TMetaTitle
  mutations: TMutation[] | undefined
}

const CalendarMainModal = ({
  mainModalData,
  setMainModalData,
  metaTitle,
  mutations,
}: Props) => {
  const [subModalData, setSubModalData] = useState<TSpecimen | null>(null)

  const { data: editions } = useEditionListQuery()
  const { data: owners } = useOwnerListQuery()
  const { t } = useTranslation()
  const { formatDate } = useFormatDate()
  return (
    <>
      <ModalContainer
        onClose={() => {
          setMainModalData(null)
        }}
        closeButton={{
          callback: () => {
            setMainModalData(null)
          },
        }}
        opened={!!mainModalData}
        header={metaTitle.name}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: '700',
            }}
          >
            {t('specimens_overview.date')}
          </Typography>
          <Typography
            sx={{
              marginBottom: '20px',
            }}
          >
            {formatDate(mainModalData?.day, {
              includeDayName: true,
              fullDayName: true,
            })}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: '700',
            }}
          >
            {t('specimens_overview.specimens')}
          </Typography>
          <Table size="small">
            <CalendarMainModalTableHead />
            <TableBody>
              {mainModalData?.data.map((s) => (
                <CalendarMainModalTableRow
                  key={s.id}
                  specimen={s}
                  editions={editions}
                  mutations={mutations}
                  owners={owners}
                  setSubModalData={setSubModalData}
                />
              ))}
            </TableBody>
          </Table>
        </Box>
      </ModalContainer>
      <CalendarSubModal
        subModalData={subModalData}
        setSubModalData={setSubModalData}
      />
    </>
  )
}

export default CalendarMainModal
