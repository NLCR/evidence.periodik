import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs, { Dayjs } from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { DateCalendar } from '@mui/x-date-pickers-pro'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { blue } from '@mui/material/colors'
import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'
import { useMutationListQuery } from '../../../../api/mutation'
import { useEditionListQuery } from '../../../../api/edition'
import { useOwnerListQuery } from '../../../../api/owner'
import {
  useSpecimenFacetsQuery,
  useSpecimenListQuery,
  useSpecimensStartDateForCalendar,
} from '../../../../api/specimen'
import { TMetaTitle } from '../../../../schema/metaTitle'
import ShowError from '../../../../components/ShowError'
import Loader from '../../../../components/Loader'
import ControlledSlider from '../ControlledSlider'
import ControlledBarCodeInput from '../ControlledBarCodeInput'
import { useLanguageCode } from '../../../../hooks/useLanguageCode'
import NameFacetGroup from './NameFacetGroup'
import SubnameFacetGroup from './SubnameFacetGroup'
import MutationFacetGroup from './MutationFacetGroup'
import EditionFacetGroup from './EditionFacetGroup'
import MutationMarkFacetGroup from './MutationMarkFacetGroup'
import OwnerFacetGroup from './OwnerFacetGroup'
import DamageTypeFacetGroup from './DamageTypeFacetGroup'
import { FacetsContext } from './FacetsContext'
import { damageTypes } from '../../../../utils/constants'

type TProps = {
  metaTitle: TMetaTitle
}

const Facets: FC<TProps> = ({ metaTitle }) => {
  const { t } = useTranslation()
  const { data: mutations } = useMutationListQuery()
  const { data: editions } = useEditionListQuery()
  const { data: owners } = useOwnerListQuery()
  const { languageCode } = useLanguageCode()
  const [metaTitleIdChanged, setMetaTitleIdChanged] = useState(false)
  const [calendarDateInitialized, setCalendarDateInitialized] = useState(false)
  const [sliderRangeInitialized, setSliderRangeInitialized] = useState(false)

  const params = useSpecimensOverviewStore((state) => state.params)
  const view = useSpecimensOverviewStore((state) => state.view)
  const calendarDate = useSpecimensOverviewStore((state) => state.calendarDate)
  const setParams = useSpecimensOverviewStore((state) => state.setParams)
  const setCalendarDate = useSpecimensOverviewStore(
    (state) => state.setCalendarDate
  )
  const resetAll = useSpecimensOverviewStore((state) => state.resetAll)
  const setSliderRange = useSpecimensOverviewStore(
    (state) => state.setSliderRange
  )
  const setLastViewedMetaTitleId = useSpecimensOverviewStore(
    (state) => state.setLastViewedMetaTitleId
  )
  const lastViewedMetaTitleId = useSpecimensOverviewStore(
    (state) => state.lastViewedMetaTitleId
  )

  const {
    data: facets,
    isError: facetsError,
    isFetching: facetsFetching,
  } = useSpecimenFacetsQuery(metaTitle.id)

  const {
    data: specimens,
    isError: specimensError,
    isFetching: specimensFetching,
  } = useSpecimenListQuery(metaTitle.id)

  const {
    data: calendarDateFromQuery,
    isFetching: calendarStartDateFetching,
    isError: calendarStartDateError,
  } = useSpecimensStartDateForCalendar(metaTitle.id)

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
    Number(specimens?.publicationDayMax?.substring(0, 4)) || 2023

  const fetching =
    facetsFetching || specimensFetching || calendarStartDateFetching

  if (facetsError || specimensError || calendarStartDateError) {
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
                disabled={fetching}
              />
            ) : (
              <Loader />
            )}
          </Box>
        ) : (
          <ControlledSlider
            fetching={fetching}
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
            overflowY: 'scroll',
          })}
        >
          <FacetsContext.Provider
            value={{
              damageTypes: damageTypes,
              disabled: fetching,
              editions: editions,
              facets: facets,
              languageCode: languageCode,
              mutations: mutations,
              owners: owners,
              params: params,
              setParams: setParams,
            }}
          >
            <NameFacetGroup />
            <SubnameFacetGroup />
            <MutationFacetGroup />
            <EditionFacetGroup />
            <MutationMarkFacetGroup />
            <OwnerFacetGroup />
            <DamageTypeFacetGroup />
          </FacetsContext.Provider>
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
