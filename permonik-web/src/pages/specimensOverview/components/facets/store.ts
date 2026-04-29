import { useSpecimensOverviewStore } from '../../../../slices/useSpecimensOverviewStore'

export const useFacetsStoreData = () => {
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

  return {
    params,
    view,
    calendarDate,
    setParams,
    setCalendarDate,
    resetAll,
    setSliderRange,
    setLastViewedMetaTitleId,
    lastViewedMetaTitleId,
  }
}
