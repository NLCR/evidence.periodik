import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import flow from 'lodash/flow'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { TSpecimen } from '../../../../schema/specimen'
import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { TMetaTitle } from '../../../../schema/metaTitle'
import ShowInfoMessage from '../../../../components/ShowInfoMessage'
import { useMutationListQuery } from '../../../../api/mutation'
import Loader from '../../../../components/Loader'
import { useSpecimenListQuery } from '../../../../api/specimen'
import ShowError from '../../../../components/ShowError'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'
import { TMainModalData } from './models'
import CalendarMainModal from './mainModal/CalendarMainModal'
import theme from '../../../../theme'
import Button from '@mui/material/Button'

type TProps = {
  metaTitle: TMetaTitle
  switchToTable: () => void
}

type TSpecimensDay = {
  day: string
  isPreviousMonth: boolean
  specimens: TSpecimen[][]
}[]

const getFirstMondayOfMonth = (date: Date | null) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = date.getMonth()

  // Find the first Monday in the month
  let firstMonday = dayjs().year(year).month(month).date(1)
  while (firstMonday.day() !== 1) {
    firstMonday = firstMonday.add(1, 'day')
  }

  return firstMonday
}

const Calendar: FC<TProps> = ({ metaTitle, switchToTable }) => {
  const { t } = useTranslation()
  const calendarDate = useSpecimensOverviewStore((state) => state.calendarDate)
  const { data: mutations } = useMutationListQuery()
  const { languageCode } = useLanguageCode()

  const [mainModalData, setMainModalData] = useState<TMainModalData>(null)

  const {
    data: specimens,
    isFetching: specimensFetching,
    isError: specimensError,
  } = useSpecimenListQuery(metaTitle.id)

  if (specimensFetching) {
    return <Loader />
  }

  if (specimensError) {
    return <ShowError />
  }

  const monday = getFirstMondayOfMonth(dayjs(calendarDate).toDate())
  const dayJs = dayjs(calendarDate)
  const daysInMonth = dayJs.daysInMonth()
  const daysArray: string[] = []
  for (let i = 1; i <= daysInMonth; i += 1) {
    daysArray.push(dayJs.set('date', i).format('YYYY-MM-DD'))
  }

  const groupedSpecimensByDay = flow(
    (rawSpecimens: TSpecimen[]) =>
      groupBy(rawSpecimens, (s) => s.publicationDate),
    (groupedSpecimens) =>
      map(groupedSpecimens, (value, key) => ({ day: key, specimens: value }))
  )(specimens?.specimens || [])

  const specimensInDay: TSpecimensDay = []

  daysArray.forEach((day) => {
    const found = groupedSpecimensByDay.find((group) => group.day.includes(day))
    if (found) {
      const groupedBySameAttributes = Object.values(
        sortBy(
          groupBy(
            found.specimens,
            (obj) =>
              `${obj.mutationId}_${obj.mutationMark ?? obj.mutationMarkNumber}_${obj.number}`
          ),
          (obj) =>
            obj.map(
              (o) => `${o.mutationId}_${o.mutationMark ?? o.mutationMarkNumber}`
            )
        )
      )
      specimensInDay.push({
        day,
        isPreviousMonth: false,
        specimens: groupedBySameAttributes,
      })
    } else {
      specimensInDay.push({ day, isPreviousMonth: false, specimens: [] })
    }
  })

  if (monday) {
    const daysToPreviousMonth = monday.get('D') - 7
    const startOfMonth = dayjs(calendarDate).date(1)
    if (daysToPreviousMonth <= 0 && daysToPreviousMonth > -6) {
      const missingDaysOfPreviousMonth: TSpecimensDay = []
      for (let i = daysToPreviousMonth; i <= 0; i += 1) {
        missingDaysOfPreviousMonth.push({
          day: startOfMonth.date(i).format('YYYY-MM-DD'),
          isPreviousMonth: true,
          specimens: [],
        })
      }
      specimensInDay.unshift(...missingDaysOfPreviousMonth)
    }
  }

  if (!specimensInDay.some((sid) => sid.specimens.length)) {
    return (
      <>
        <ShowInfoMessage
          message={t('specimens_overview.specimens_not_found')}
        />
        <Box justifyContent="center" display="flex">
          <Button onClick={switchToTable} variant="contained">
            {t('specimens_overview.switch_to_table')}
          </Button>
        </Box>
      </>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        marginTop: '16px',
        marginBottom: '16px',
        height: '100%',
        minWidth: '720px',
        overflowY: 'auto',
      }}
    >
      <CalendarMainModal
        mainModalData={mainModalData}
        setMainModalData={setMainModalData}
        metaTitle={metaTitle}
        mutations={mutations}
      />
      {specimensInDay.map((day) => (
        <Box
          key={day.day}
          sx={(theme) => ({
            backgroundColor: day.isPreviousMonth
              ? theme.palette.grey['400']
              : theme.palette.grey['100'],
            border: `2px solid white`,
            borderRadius: '4px',
            paddingTop: '4px',
            paddingLeft: '8px',
            paddingRight: '8px',
            paddingBottom: '8px',
          })}
        >
          <Typography
            sx={{
              color: theme.palette.primary.main,
              marginBottom: '4px',
            }}
          >
            {dayjs(day.day).format('dd DD')}
          </Typography>
          {/* specimens grouped by same values and displayed on one line (when clicked, individual specimens are shown) */}
          {day.specimens.map((row) => {
            const firstInRow = row.find(Boolean)
            if (firstInRow) {
              return (
                <Box
                  key={firstInRow.id}
                  sx={(theme) => ({
                    display: 'flex',
                    marginTop: '2px',
                    marginBottom: '2px',
                    padding: '2px 8px',
                    backgroundColor: theme.palette.grey['800'],
                    borderRadius: '4px',
                    color: theme.palette.grey['100'],
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    cursor: 'pointer',
                  })}
                  onClick={() => {
                    setMainModalData({ data: row, day: day.day })
                  }}
                >
                  <Typography variant="body2">
                    {firstInRow.number}{' '}
                    {
                      mutations?.find((m) => m.id === firstInRow.mutationId)
                        ?.name[languageCode]
                    }{' '}
                    {(firstInRow.mutationMark ?? firstInRow.mutationMarkNumber)
                      .length
                      ? (firstInRow.mutationMark ??
                        firstInRow.mutationMarkNumber)
                      : t('specimens_overview.without_mark')}
                  </Typography>
                  <Box
                    sx={(theme) => ({
                      display: 'flex',
                      backgroundColor: theme.palette.grey['100'],
                      borderRadius: '50%',
                      color: theme.palette.grey['900'],
                      width: '16px',
                      height: '16px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    })}
                  >
                    {row.length}
                  </Box>
                </Box>
              )
            }
            return null
          })}
        </Box>
      ))}
    </Box>
  )
}

export default Calendar
