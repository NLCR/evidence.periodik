import Box from '@mui/material/Box'
import { useMemo } from 'react'
import { type RowComponentProps } from 'react-window'
import SpecimenItem from './specimen-item/SpecimenItem'
import type { TVirtualizedSpecimenRowData } from '../VirtualizedSpecimenList'

const VirtualizedSpecimenRow = ({
  index,
  style,
  ariaAttributes,
  items,
  viewOnly,
  showOnlyRescans,
  replacementSourceCandidates,
  disabled,
}: RowComponentProps<TVirtualizedSpecimenRowData>) => {
  const { item, formIndex } = items[index]
  const replacementRows = useMemo(
    () =>
      viewOnly
        ? item.pageReplacements.map((replacement, replacementIndex) => ({
            replacement,
            replacementIndex,
            isVisible: true,
          }))
        : undefined,
    [item, viewOnly]
  )

  return (
    <Box style={style} pb={1} {...ariaAttributes}>
      <SpecimenItem
        specimen={item.specimen}
        itemPath={`items.${formIndex}`}
        viewOnly={viewOnly}
        showOnlyRescans={showOnlyRescans}
        replacementSourceCandidates={replacementSourceCandidates}
        disabled={disabled}
        replacementRows={replacementRows}
      />
    </Box>
  )
}

export default VirtualizedSpecimenRow
