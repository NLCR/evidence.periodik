import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { Dayjs } from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { DateCalendar } from '@mui/x-date-pickers-pro'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import blue from '@mui/material/colors/blue'
import { TMetaTitle } from '../../../../schema/metaTitle'
import ShowError from '../../../../components/ShowError'
import Loader from '../../../../components/Loader'
import ControlledSlider from '../ControlledSlider'
import ControlledBarCodeInput from '../ControlledBarCodeInput'
import * as FacetGroups from './facet-groups'
import { useFacetsContext } from './FacetsContext'
import { useFacetsStoreData } from './store'

type TProps = {
  metaTitle: TMetaTitle
}

const Facets: FC<TProps> = ({ metaTitle }) => {
  const { t } = useTranslation()
  const { specimens, calendarDateFromQuery, isError, isFetching } =
    useFacetsContext()
  const {
    view,
    calendarDate,
    setCalendarDate,
    lastViewedMetaTitleId,
    setLastViewedMetaTitleId,
    resetAll,
    setSliderRange,
  } = useFacetsStoreData()

  const [metaTitleIdChanged, setMetaTitleIdChanged] = useState(false)
  const [calendarDateInitialized, setCalendarDateInitialized] = useState(false)
  const [sliderRangeInitialized, setSliderRangeInitialized] = useState(false)

  // track if metaTitle changed
  useEffect(() => {
    if (lastViewedMetaTitleId !== metaTitle.id) {
      resetAll()
      setLastViewedMetaTitleId(metaTitle.id)
      setMetaTitleIdChanged(true)
    }
  }, [lastViewedMetaTitleId, metaTitle, resetAll, setLastViewedMetaTitleId])

  // Initialize calendar date
  useEffect(() => {
    if (
      calendarDateFromQuery &&
      metaTitleIdChanged &&
      !calendarDateInitialized
    ) {
      setCalendarDate(dayjs(calendarDateFromQuery.toString()))
      setCalendarDateInitialized(true)
    }
  }, [
    calendarDateFromQuery,
    calendarDateInitialized,
    metaTitleIdChanged,
    setCalendarDate,
  ])

  // Initialize date range slider
  useEffect(() => {
    if (specimens && metaTitleIdChanged && !sliderRangeInitialized) {
      setSliderRange([
        Number(specimens.publicationDayMin?.substring(0, 4)),
        Number(specimens.publicationDayMax?.substring(0, 4)),
      ])
      setSliderRangeInitialized(true)
    }
  }, [metaTitleIdChanged, setSliderRange, sliderRangeInitialized, specimens])

  // Reset initialization indicators after initialization is done
  useEffect(() => {
    if (
      sliderRangeInitialized &&
      calendarDateInitialized &&
      metaTitleIdChanged
    ) {
      setMetaTitleIdChanged(false)
      setCalendarDateInitialized(false)
      setSliderRangeInitialized(false)
    }
  }, [calendarDateInitialized, metaTitleIdChanged, sliderRangeInitialized])

  const publicationYearMin =
    Number(specimens?.publicationDayMin?.substring(0, 4)) || 1900
  const publicationYearMax =
    Number(specimens?.publicationDayMax?.substring(0, 4)) || dayjs().year()

  if (isError) {
    return (
      <>
        <Typography
          variant="h6"
          sx={{
            color: blue['900'],
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
            color: blue['900'],
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
        {view === 'calendar' ? (
          <Box>
            {dayjs(calendarDate).isValid() ? (
              <DateCalendar
                views={['month', 'year']}
                openTo="month"
                sx={{
                  height: 'auto',
                }}
                value={dayjs(calendarDate)}
                minDate={dayjs(specimens?.publicationDayMin)}
                maxDate={dayjs(specimens?.publicationDayMax)}
                onChange={(value: Dayjs) => {
                  setCalendarDate(value)
                }}
                disabled={isFetching}
              />
            ) : (
              <Loader />
            )}
          </Box>
        ) : (
          <ControlledSlider
            fetching={isFetching}
            pubDaysMin={publicationYearMin}
            pubDaysMax={publicationYearMax}
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
        sx={{ flexShrink: 0, flexGrow: 0 }}
        startIcon={<DeleteOutlineOutlinedIcon />}
        variant="outlined"
        color="error"
        onClick={() => {
          resetAll()
          setSliderRange([publicationYearMin, publicationYearMax])
          setCalendarDate(dayjs(specimens?.publicationDayMin))
        }}
      >
        {t('specimens_overview.delete_filters')}
      </Button>
    </>
  )
}

export default Facets
