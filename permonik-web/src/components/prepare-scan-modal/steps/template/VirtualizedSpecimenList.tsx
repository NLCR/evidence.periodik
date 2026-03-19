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
} from 'react'
import { useTranslation } from 'react-i18next'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { TSpecimen } from '../../../../schema/specimen'
import { TReplacementSource } from '../../schemas/schemas'
import SpecimenItem from './SpecimenItem'

type Props =
  | {
      items: TSpecimen[]
      viewOnly: true
      replacementSourceCandidates?: never
    }
  | {
      items: TSpecimen[]
      viewOnly: false
      replacementSourceCandidates: TReplacementSource[]
    }

type RowData = {
  items: TSpecimen[]
  viewOnly: boolean
  replacementSourceCandidates: TReplacementSource[]
  setRowHeight: (index: number, height: number) => void
}

const LIST_HEIGHT = 560
const ESTIMATED_ROW_HEIGHT = 280
const OVERSCAN_COUNT = 3

const Row = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const item = data.items[index]

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
          specimen={item}
          viewOnly={data.viewOnly}
          replacementSourceCandidates={data.replacementSourceCandidates}
        />
      </Box>
    </Box>
  )
})

Row.displayName = 'VirtualizedSpecimenListRow'

const VirtualizedSpecimenList = (props: Props) => {
  const { items, viewOnly } = props
  const replacementSourceCandidates = useMemo(
    () => (viewOnly ? [] : props.replacementSourceCandidates),
    [props.replacementSourceCandidates, viewOnly]
  )

  const { t } = useTranslation()
  const listRef = useRef<VariableSizeList<RowData> | null>(null)
  const rowHeightsRef = useRef<Record<number, number>>({})

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
      items,
      viewOnly,
      replacementSourceCandidates,
      setRowHeight,
    }),
    [items, replacementSourceCandidates, setRowHeight, viewOnly]
  )

  useEffect(() => {
    rowHeightsRef.current = {}
    listRef.current?.resetAfterIndex(0, true)
  }, [items, viewOnly])

  if (items.length === 0) {
    return (
      <Typography>
        {t('prepare_scan_modal.content_template.no_items')}
      </Typography>
    )
  }

  return (
    <VariableSizeList
      ref={listRef}
      height={LIST_HEIGHT}
      width="100%"
      itemCount={items.length}
      itemData={itemData}
      itemSize={getItemSize}
      estimatedItemSize={ESTIMATED_ROW_HEIGHT}
      overscanCount={OVERSCAN_COUNT}
      itemKey={(index, data) => data.items[index].id}
    >
      {Row}
    </VariableSizeList>
  )
}

export default VirtualizedSpecimenList
