import Box from '@mui/material/Box'
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
  showOnlyUnlocked,
  replacementSourceCandidates,
  disabled,
}: RowComponentProps<TVirtualizedSpecimenRowData>) => {
  const { item, formIndex } = items[index]
  return (
    <Box style={style} pb={1} {...ariaAttributes}>
      <SpecimenItem
        specimen={item.specimen}
        itemPath={`items.${formIndex}`}
        viewOnly={viewOnly}
        showOnlyRescans={showOnlyRescans}
        showOnlyUnlocked={showOnlyUnlocked}
        replacementSourceCandidates={replacementSourceCandidates}
        disabled={disabled}
      />
    </Box>
  )
}

export default VirtualizedSpecimenRow
