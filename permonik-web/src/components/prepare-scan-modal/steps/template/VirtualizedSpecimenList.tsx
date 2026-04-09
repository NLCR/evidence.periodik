import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { TReplacementSource, TTemplateItem } from '../../schemas/schemas'
import SpecimenItem from './SpecimenItem'
import { getVisibleTemplateItems } from './templateGrouping'

type Props = {
  items: TTemplateItem[]
  showOnlyRescans: boolean
} & (
  | {
      viewOnly: true
      replacementSourceCandidates?: never
    }
  | {
      viewOnly: false
      replacementSourceCandidates: TReplacementSource[]
    }
)

type RowData = {
  items: Array<{ item: TTemplateItem; formIndex: number }>
  viewOnly: boolean
  showOnlyRescans: boolean
  replacementSourceCandidates: TReplacementSource[]
  setRowHeight: (index: number, height: number) => void
}

const ESTIMATED_ROW_HEIGHT = 280
const OVERSCAN_COUNT = 3

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

const Row = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const { item, formIndex } = data.items[index]

  const rowStyle = useMemo<CSSProperties>(
    () => ({ ...style, width: '100%' }),
    [style]
  )

  useLayoutEffect(() => {
    const element = rowRef.current

    if (!element) return

    const measure = () => {
      data.setRowHeight(
        index,
        Math.ceil(element.getBoundingClientRect().height)
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)

    return () => observer.disconnect()
  }, [data, index])

  return (
    <Box style={rowStyle}>
      <Box ref={rowRef} pb={1}>
        <SpecimenItem
          specimen={item.specimen}
          itemPath={`items.${formIndex}`}
          viewOnly={data.viewOnly}
          showOnlyRescans={data.showOnlyRescans}
          replacementSourceCandidates={data.replacementSourceCandidates}
        />
      </Box>
    </Box>
  )
})

Row.displayName = 'VirtualizedSpecimenListRow'

const VirtualizedSpecimenList = (props: Props) => {
  const { items, viewOnly, showOnlyRescans } = props

  const visibleItems = useMemo(
    () => getVisibleTemplateItems(items, showOnlyRescans),
    [items, showOnlyRescans]
  )

  const replacementSourceCandidates = useMemo(
    () => (viewOnly ? [] : props.replacementSourceCandidates),
    [props.replacementSourceCandidates, viewOnly]
  )
  const visibleItemIds = useMemo(
    () => visibleItems.map(({ item }) => item.specimen.id),
    [visibleItems]
  )

  const { t } = useTranslation()
  const listRef = useRef<VariableSizeList<RowData> | null>(null)
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

  const itemData = useMemo<RowData>(
    () => ({
      items: visibleItems,
      viewOnly,
      showOnlyRescans,
      replacementSourceCandidates,
      setRowHeight,
    }),
    [
      replacementSourceCandidates,
      setRowHeight,
      showOnlyRescans,
      viewOnly,
      visibleItems,
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
        {Row}
      </VariableSizeList>
    </Box>
  )
}

export default VirtualizedSpecimenList
