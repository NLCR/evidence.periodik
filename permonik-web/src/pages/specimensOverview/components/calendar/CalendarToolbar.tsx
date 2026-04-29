import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import dayjs from 'dayjs'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import React, { FC } from 'react'
import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { useSpecimenListQuery } from '../../../../api/specimen'
import { TMetaTitle } from '../../../../schema/metaTitle'

type TProps = {
  metaTitle: TMetaTitle
}

const CalendarToolbar: FC<TProps> = ({ metaTitle }) => {
  const setCalendarDate = useSpecimensOverviewStore(
    (state) => state.setCalendarDate
  )
  const calendarDate = useSpecimensOverviewStore((state) => state.calendarDate)

  const { data: specimens } = useSpecimenListQuery(metaTitle.id)

  return (
    <>
      {/* <Typography
        sx={{
          fontWeight: '600',
          marginRight: '20px',
        }}
      >
        {t('specimens_overview.showed_month')}:{' '}
      </Typography> */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '220px',
        }}
      >
        <IconButton
          sx={{
            marginTop: '2px',
          }}
          disabled={
            dayjs(calendarDate).diff(
              dayjs(specimens?.publicationDayMin),
              'month'
            ) <= 0
          }
          onClick={() => {
            setCalendarDate(dayjs(calendarDate).subtract(1, 'month'))
          }}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>{' '}
        <Typography
          sx={{
            fontWeight: '600',
            marginLeft: '10px',
            marginRight: '10px',
          }}
        >
          {dayjs(calendarDate).format('MMMM YYYY')}
        </Typography>
        <IconButton
          sx={{
            marginTop: '2px',
          }}
          disabled={
            !(
              dayjs(calendarDate).diff(
                dayjs(specimens?.publicationDayMax),
                'month'
              ) < 0
            )
          }
          onClick={() => {
            setCalendarDate(dayjs(calendarDate).add(1, 'month'))
          }}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </>
  )
}

export default CalendarToolbar
