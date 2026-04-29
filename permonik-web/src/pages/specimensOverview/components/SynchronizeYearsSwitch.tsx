import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import React from 'react'
import { useSpecimensOverviewStore } from '../../../slices/useSpecimensOverviewStore'
import { useTranslation } from 'react-i18next'
import { useSpecimenListQuery } from '../../../api/specimen'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const SynchronizeYearsSwitch = () => {
  const { t } = useTranslation()
  const { metaTitleId } = useParams()
  const { data: specimens } = useSpecimenListQuery(metaTitleId)

  const setCalendarDate = useSpecimensOverviewStore(
    (state) => state.setCalendarDate
  )
  const setSliderRange = useSpecimensOverviewStore(
    (state) => state.setSliderRange
  )
  const setParams = useSpecimensOverviewStore((state) => state.setParams)
  const setPagination = useSpecimensOverviewStore(
    (state) => state.setPagination
  )
  const synchronizeYearsBetweenViews = useSpecimensOverviewStore(
    (state) => state.synchronizeYearsBetweenViews
  )
  const setSynchronizeYearsBetweenViews = useSpecimensOverviewStore(
    (state) => state.setSynchronizeYearsBetweenViews
  )

  useSpecimensOverviewStore.subscribe((state, prevState) => {
    if (
      state.view !== prevState.view &&
      state.synchronizeYearsBetweenViews &&
      specimens?.specimens.length
    ) {
      if (state.view === 'CALENDAR') {
        setCalendarDate(dayjs(specimens.specimens[0].publicationDate))
      }
      if (state.view === 'TABLE') {
        const publicationDate = dayjs(specimens.specimens[0].publicationDate)
        const publicationDateMax = dayjs(specimens.publicationDayMax)

        setPagination({ ...state.pagination, pageIndex: 0 })
        setParams({
          ...state.params,
          dateStart: publicationDate.isBefore(publicationDateMax)
            ? publicationDate
            : publicationDateMax,
          dateEnd: state.params.dateEnd
            ? state.params.dateEnd
            : publicationDateMax,
        })
        setSliderRange([
          publicationDate,
          state.sliderRange ? state.sliderRange[1] : publicationDateMax,
        ])
      }
    }
  })

  return (
    <FormControlLabel
      sx={{ paddingLeft: '8px' }}
      control={
        <Switch
          checked={synchronizeYearsBetweenViews}
          onChange={(event) => {
            setSynchronizeYearsBetweenViews(event.target.checked)
          }}
        />
      }
      label={
        <span
          dangerouslySetInnerHTML={{
            __html: t('specimens_overview.synchronize_years_between_views'),
          }}
        />
      }
    />
  )
}

export default SynchronizeYearsSwitch
