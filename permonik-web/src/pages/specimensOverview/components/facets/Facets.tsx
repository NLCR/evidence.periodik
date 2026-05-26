import { type FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { type Dayjs } from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { DateCalendar } from '@mui/x-date-pickers-pro'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { type TMetaTitle } from '../../../../schema/metaTitle'
import ShowError from '../../../../components/ShowError'
import Loader from '../../../../components/Loader'
import ControlledSliderAndDateInput from '../ControlledSliderAndDateInput'
import ControlledBarCodeInput from '../ControlledBarCodeInput'
import * as FacetGroups from './facet-groups'
import { useFacetsContext } from './FacetsContext'
import { useFacetsStoreData } from './store'
import NumberOptionsTabMultiSelect from './NumberOptionsTabMultiSelect'
import theme from '../../../../theme'

type TProps = {
  metaTitle: TMetaTitle
}

const Facets: FC<TProps> = ({ metaTitle }) => {
  const { t } = useTranslation()
  const {
    specimens,
    specimensIsPlaceholderData,
    calendarDateFromQuery,
    isError,
    isFetching,
  } = useFacetsContext()
  const {
    view,
    calendarDate,
    setCalendarDate,
    lastViewedMetaTitleId,
    setLastViewedMetaTitleId,
    resetAll,
    setSliderRange,
  } = useFacetsStoreData()

  const metaTitleChanged = useRef(false)
  const calendarInitialized = useRef(false)
  const sliderInitialized = useRef(false)

  // track if metaTitle changed
  useEffect(() => {
    if (lastViewedMetaTitleId !== metaTitle.id) {
      metaTitleChanged.current = true
      sliderInitialized.current = false
      calendarInitialized.current = false
      resetAll()
      setLastViewedMetaTitleId(metaTitle.id)
    }
  }, [lastViewedMetaTitleId, metaTitle, resetAll, setLastViewedMetaTitleId])

  useEffect(() => {
    if (!metaTitleChanged.current) return
    if (calendarDateFromQuery && !calendarInitialized.current) {
      setCalendarDate(dayjs(calendarDateFromQuery.toString()))
      calendarInitialized.current = true
    }

    if (
      !specimensIsPlaceholderData &&
      specimens &&
      !sliderInitialized.current
    ) {
      setSliderRange([
        dayjs(
          new Date(
            Number(specimens.publicationDayMin?.substring(0, 4)), // year
            0, // month
            1 // date
          )
        ),
        dayjs(
          new Date(
            Number(specimens.publicationDayMax?.substring(0, 4)), // year
            11, // month
            31 // date
          )
        ),
      ])
      sliderInitialized.current = true
    }

    if (calendarInitialized.current && sliderInitialized.current)
      metaTitleChanged.current = false
  }, [
    specimens,
    specimensIsPlaceholderData,
    calendarDateFromQuery,
    setCalendarDate,
    setSliderRange,
  ])

  const publicationDateMin = dayjs(specimens?.publicationDayMin)
  const publicationDateMax = dayjs(specimens?.publicationDayMax)

  if (isError) {
    return (
      <>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.primary.main,
          }}
        >
          {metaTitle.name}
        </Typography>
        <ShowError />
      </>
    )
  }

  return (
    <>
      <Box sx={{ flexShrink: 0, flexGrow: 0 }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: '600',
          }}
        >
          {metaTitle.name}
        </Typography>
        <Divider
          sx={{
            marginTop: '10px',
            marginBottom: '10px',
          }}
        />
      </Box>
      <Box
        sx={{
          flexShrink: 1,
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: '700',
          }}
        >
          {t('specimens_overview.date')}
        </Typography>
        {view === 'CALENDAR' ? (
          <Box>
            {dayjs(calendarDate).isValid() ? (
              <DateCalendar
                views={['year', 'month']}
                openTo="month"
                sx={{
                  height: 'auto',
                }}
                value={dayjs(calendarDate)}
                minDate={dayjs(specimens?.publicationDayMin)}
                maxDate={dayjs(specimens?.publicationDayMax)}
                onChange={(value: Dayjs | null) => {
                  if (value) setCalendarDate(value)
                }}
                disabled={isFetching}
              />
            ) : (
              <Loader />
            )}
          </Box>
        ) : (
          <ControlledSliderAndDateInput
            fetching={isFetching}
            pubDateMin={publicationDateMin}
            pubDateMax={publicationDateMax}
          />
        )}
        <Typography
          variant="body2"
          sx={{
            // marginTop: '30px',
            marginBottom: '10px',
            fontWeight: '700',
          }}
        >
          {t('specimens_overview.volume')}
        </Typography>
        <ControlledBarCodeInput />
        <Divider
          sx={{
            marginTop: '10px',
          }}
        />

        <NumberOptionsTabMultiSelect />
        <Divider
          sx={{
            marginTop: '10px',
          }}
        />

        <Box
          sx={() => ({
            paddingRight: '8px',
            overflowY: 'auto',
          })}
        >
          <FacetGroups.OwnerFacetGroup />
          <FacetGroups.MutationFacetGroup />
          <FacetGroups.MutationMarkFacetGroup />
          <FacetGroups.EditionFacetGroup />
          <FacetGroups.NameFacetGroup />
          <FacetGroups.SubnameFacetGroup />
          <FacetGroups.DamageTypeFacetGroup />
        </Box>
        <Divider
          sx={{
            marginBottom: '10px',
          }}
        />
      </Box>
      <Button
        sx={{ flexShrink: 0, flexGrow: 0, marginTop: 1 }}
        startIcon={<DeleteOutlineOutlinedIcon />}
        variant="outlined"
        color="error"
        onClick={() => {
          resetAll([publicationDateMin, publicationDateMax])
          setSliderRange([publicationDateMin, publicationDateMax])
          setCalendarDate(dayjs(specimens?.publicationDayMin))
        }}
      >
        {t('specimens_overview.delete_filters')}
      </Button>
    </>
  )
}

export default Facets
