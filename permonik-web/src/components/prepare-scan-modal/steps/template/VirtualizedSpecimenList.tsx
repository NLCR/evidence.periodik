import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { VariableSizeList } from 'react-window'
import type {
  TReplacementSource,
  TTemplateItem,
  TTemplateItemWithFormIndex,
} from '@/components/prepare-scan-modal/schemas/schemas'
import VirtualizedSpecimenRow from './components/VirtualizedSpecimenRow'
import { getFilteredTemplateItems } from './utils/filters'

const ESTIMATED_ROW_HEIGHT = 280
const OVERSCAN_COUNT = 3

type TVirtualizedSpecimenListProps = {
  items: TTemplateItem[]
  viewOnly: boolean
  showOnlyRescans: boolean
  showOnlyUnlocked: boolean
  replacementSourceCandidates?: TReplacementSource[]
  disabled?: boolean
}

export type TVirtualizedSpecimenRowData = {
  items: TTemplateItemWithFormIndex[]
  viewOnly: boolean
  showOnlyRescans: boolean
  replacementSourceCandidates: TReplacementSource[]
  setRowHeight: (index: number, height: number) => void
  disabled?: boolean
}

const hasListCompositionChanged = (
  previousItemIds: string[],
  nextItemIds: string[]
) => {
  if (previousItemIds.length !== nextItemIds.length) return true

  for (let index = 0; index < previousItemIds.length; index += 1) {
    if (previousItemIds[index] !== nextItemIds[index]) return true
  }

  return false
}

const VirtualizedSpecimenList = ({
  items,
  viewOnly,
  showOnlyRescans,
  showOnlyUnlocked,
  replacementSourceCandidates: _replacementSourceCandidates = [],
  disabled = false,
}: TVirtualizedSpecimenListProps) => {
  const visibleItems = useMemo(
    () => getFilteredTemplateItems(items, showOnlyRescans, showOnlyUnlocked),
    [items, showOnlyRescans, showOnlyUnlocked]
  )

  const replacementSourceCandidates = useMemo(
    () => (viewOnly ? [] : _replacementSourceCandidates),
    [_replacementSourceCandidates, viewOnly]
  )
  const visibleItemIds = useMemo(
    () => visibleItems.map(({ item }) => item.specimen.id),
    [visibleItems]
  )

  const { t } = useTranslation()
  const listRef = useRef<VariableSizeList<TVirtualizedSpecimenRowData> | null>(
    null
  )
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rowHeightsRef = useRef<Record<number, number>>({})
  const previousVisibleItemIdsRef = useRef<string[] | null>(null)
  const [listHeight, setListHeight] = useState(ESTIMATED_ROW_HEIGHT * 2)

  const setRowHeight = useCallback((index: number, height: number) => {
    const currentHeight = rowHeightsRef.current[index]

    if (currentHeight === height) return

    rowHeightsRef.current[index] = height
    listRef.current?.resetAfterIndex(index)
  }, [])

  const getItemSize = useCallback(
    (index: number) => rowHeightsRef.current[index] ?? ESTIMATED_ROW_HEIGHT,
    []
  )

  const itemData = useMemo<TVirtualizedSpecimenRowData>(
    () => ({
      items: visibleItems,
      viewOnly,
      showOnlyRescans,
      replacementSourceCandidates,
      setRowHeight,
      disabled,
    }),
    [
      replacementSourceCandidates,
      setRowHeight,
      showOnlyRescans,
      viewOnly,
      visibleItems,
      disabled,
    ]
  )

  useEffect(() => {
    const previousVisibleItemIds = previousVisibleItemIdsRef.current
    const shouldResetCache =
      previousVisibleItemIds === null ||
      hasListCompositionChanged(previousVisibleItemIds, visibleItemIds)

    if (shouldResetCache) {
      rowHeightsRef.current = {}
      listRef.current?.resetAfterIndex(0, true)
    }

    previousVisibleItemIdsRef.current = visibleItemIds
  }, [visibleItemIds])

  useLayoutEffect(() => {
    const element = containerRef.current

    if (!element) return

    const updateHeight = () => {
      const measuredHeight = Math.floor(element.getBoundingClientRect().height)

      if (measuredHeight <= 0) return
      setListHeight((currentHeight) =>
        currentHeight === measuredHeight ? currentHeight : measuredHeight
      )
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  if (visibleItems.length === 0) {
    return (
      <Typography>
        {t('prepare_scan_modal.content_template.no_items')}
      </Typography>
    )
  }

  return (
    <Box ref={containerRef} sx={{ height: '100%', minHeight: 0 }}>
      <VariableSizeList
        ref={listRef}
        height={listHeight}
        width="100%"
        itemCount={visibleItems.length}
        itemData={itemData}
        itemSize={getItemSize}
        estimatedItemSize={ESTIMATED_ROW_HEIGHT}
        overscanCount={OVERSCAN_COUNT}
        itemKey={(index, data) => data.items[index].item.specimen.id}
      >
        {VirtualizedSpecimenRow}
      </VariableSizeList>
    </Box>
  )
}

export default VirtualizedSpecimenList
