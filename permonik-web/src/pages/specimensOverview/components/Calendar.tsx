import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import React, { FC, useState } from 'react'
import flow from 'lodash/flow'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import { Link as ReactLink, useNavigate, useParams } from 'react-router-dom'
import { blue } from '@mui/material/colors'
import { TSpecimen } from '../../../schema/specimen'
import { useSpecimensOverviewStore } from '../../../slices/useSpecimensOverviewStore'
import { TMetaTitle } from '../../../schema/metaTitle'
import ShowInfoMessage from '../../../components/ShowInfoMessage'
import { useMutationListQuery } from '../../../api/mutation'
import Loader from '../../../components/Loader'
import { useSpecimenListQuery } from '../../../api/specimen'
import ShowError from '../../../components/ShowError'
import VolumeStatsModalContent from '../../../components/VolumeStatsModalContent'
import { useEditionListQuery } from '../../../api/edition'
import { useOwnerListQuery } from '../../../api/owner'
import ModalContainer from '../../../components/ModalContainer'
import { useLanguageCode } from '../../../hooks/useLanguageCode'
import { generateVolumeUrlWithParams } from '../../../utils/generateVolumeUrlWithParams'

type TProps = {
  metaTitle: TMetaTitle
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

const Calendar: FC<TProps> = ({ metaTitle }) => {
  const { t, i18n } = useTranslation()
  const { metaTitleId } = useParams()
  const navigate = useNavigate()
  const calendarDate = useSpecimensOverviewStore((state) => state.calendarDate)
  const { data: mutations } = useMutationListQuery()
  const { data: editions } = useEditionListQuery()
  const { data: owners } = useOwnerListQuery()
  const { languageCode } = useLanguageCode()

  const [mainModalData, setMainModalData] = useState<{
    data: TSpecimen[]
    day: string
  } | null>(null)
  const [subModalData, setSubModalData] = useState<TSpecimen | null>(null)

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
            (obj) => `${obj.mutationId}_${obj.mutationMark}_${obj.number}`
          ),
          (obj) => obj.map((o) => `${o.mutationId}_${o.mutationMark}`)
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
      <ShowInfoMessage message={t('specimens_overview.specimens_not_found')} />
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
            {dayjs(mainModalData?.day).format('dddd DD.MM.YYYY')}
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
            <TableHead>
              <TableRow>
                <TableCell>{t('specimens_overview.mutation')}</TableCell>
                <TableCell>{t('specimens_overview.edition')}</TableCell>
                <TableCell>{t('specimens_overview.name')}</TableCell>
                <TableCell>{t('specimens_overview.sub_name')}</TableCell>
                <TableCell>{t('specimens_overview.owner')}</TableCell>
                <TableCell>{t('specimens_overview.digitization')}</TableCell>
                <TableCell>
                  {t('specimens_overview.volume_overview_modal_link')}
                </TableCell>
                <TableCell>
                  {t('specimens_overview.volume_detail_link')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mainModalData?.data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    {
                      mutations?.find((m) => m.id === s.mutationId)?.name[
                        languageCode
                      ]
                    }
                  </TableCell>
                  <TableCell>
                    {
                      editions?.find((p) => p.id === s.editionId)?.name[
                        languageCode
                      ]
                    }
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: '300px',
                    }}
                  >
                    {s.subName}
                  </TableCell>
                  <TableCell>
                    <Typography
                      component="a"
                      href={`https://www.knihovny.cz/Search/Results?lookfor=${s.barCode}&type=AllFields&limit=20`}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        color: blue['700'],
                        transition: 'color 0.1s',
                        ':hover': {
                          color: blue['900'],
                        },
                      }}
                    >
                      {owners?.find((o) => o.id === s.ownerId)?.shorthand}{' '}
                      <OpenInNewIcon
                        sx={{
                          marginLeft: '3px',
                        }}
                      />
                    </Typography>
                  </TableCell>
                  <TableCell />
                  <TableCell>
                    <Typography
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        color: blue['700'],
                        transition: 'color 0.1s',
                        ':hover': {
                          color: blue['900'],
                        },
                      }}
                      onClick={() => {
                        setSubModalData(s)
                      }}
                    >
                      {t('specimens_overview.open')}
                      <DriveFileMoveOutlinedIcon
                        sx={{
                          marginLeft: '3px',
                        }}
                      />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      component={ReactLink}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        color: blue['700'],
                        transition: 'color 0.1s',
                        ':hover': {
                          color: blue['900'],
                        },
                      }}
                      to={generateVolumeUrlWithParams(
                        `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${
                          s.volumeId
                        }`,
                        metaTitleId || '',
                        s.id
                      )}
                    >
                      {s.barCode}{' '}
                      <DriveFileMoveOutlinedIcon
                        sx={{
                          marginLeft: '3px',
                        }}
                      />
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </ModalContainer>
      <ModalContainer
        autoWidth
        minWidth="30rem"
        onClose={() => {
          setSubModalData(null)
        }}
        closeButton={{
          callback: () => {
            setSubModalData(null)
          },
        }}
        acceptButton={{
          callback: () => {
            if (subModalData?.volumeId) {
              navigate(
                generateVolumeUrlWithParams(
                  `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${
                    subModalData.volumeId
                  }`,
                  metaTitleId || '',
                  subModalData.id
                )
              )
            }
          },
          text: t('specimens_overview.detailed_volume_overview'),
        }}
        opened={!!subModalData}
        header={`${t('specimens_overview.volume_overview_modal_link')} ${subModalData?.barCode}`}
      >
        <VolumeStatsModalContent volumeId={subModalData?.volumeId} />
      </ModalContainer>
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
              color: blue['900'],
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
                    {firstInRow.mutationMark.length
                      ? firstInRow.mutationMark
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
