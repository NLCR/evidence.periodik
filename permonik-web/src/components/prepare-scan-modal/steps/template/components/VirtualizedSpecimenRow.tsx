import Box from '@mui/material/Box'
import { CSSProperties, memo, useLayoutEffect, useMemo, useRef } from 'react'
import { ListChildComponentProps } from 'react-window'
import SpecimenItem from './specimen-item/SpecimenItem'
import type { TVirtualizedSpecimenRowData } from '../VirtualizedSpecimenList'

const VirtualizedSpecimenRow = memo(
  ({
    index,
    style,
    data,
  }: ListChildComponentProps<TVirtualizedSpecimenRowData>) => {
    const rowRef = useRef<HTMLDivElement | null>(null)
    const { item, formIndex } = data.items[index]
    const { setRowHeight } = data
    const replacementRows = useMemo(
      () =>
        data.viewOnly
          ? item.pageReplacements.map((replacement, replacementIndex) => ({
              replacement,
              replacementIndex,
              isVisible: true,
            }))
          : undefined,
      [data.viewOnly, item]
    )

    const rowStyle = useMemo<CSSProperties>(
      () => ({ ...style, width: '100%' }),
      [style]
    )

    useLayoutEffect(() => {
      const element = rowRef.current

      if (!element) return

      const measure = () => {
        setRowHeight(index, Math.ceil(element.getBoundingClientRect().height))
      }

      measure()

      const observer = new ResizeObserver(measure)
      observer.observe(element)

      return () => observer.disconnect()
    }, [index, setRowHeight])

    return (
      <Box style={rowStyle}>
        <Box ref={rowRef} pb={1}>
          <SpecimenItem
            specimen={item.specimen}
            itemPath={`items.${formIndex}`}
            viewOnly={data.viewOnly}
            showOnlyRescans={data.showOnlyRescans}
            replacementSourceCandidates={data.replacementSourceCandidates}
            disabled={data.disabled}
            replacementRows={replacementRows}
          />
        </Box>
      </Box>
    )
  }
)

VirtualizedSpecimenRow.displayName = 'VirtualizedSpecimenListRow'

export default VirtualizedSpecimenRow
