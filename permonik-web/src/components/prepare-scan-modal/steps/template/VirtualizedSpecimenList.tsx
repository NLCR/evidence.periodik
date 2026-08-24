import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { List, useDynamicRowHeight } from 'react-window'
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
  disabled?: boolean
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
  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: ESTIMATED_ROW_HEIGHT,
    key: visibleItemIds.join(','),
  })

  const itemData = useMemo<TVirtualizedSpecimenRowData>(
    () => ({
      items: visibleItems,
      viewOnly,
      showOnlyRescans,
      replacementSourceCandidates,
      disabled,
    }),
    [
      replacementSourceCandidates,
      showOnlyRescans,
      viewOnly,
      visibleItems,
      disabled,
    ]
  )

  const getRowKey = useCallback(
    (index: number, data: TVirtualizedSpecimenRowData) =>
      data.items[index].item.specimen.id,
    []
  )

  if (visibleItems.length === 0) {
    return (
      <Typography>
        {t('prepare_scan_modal.content_template.no_items')}
      </Typography>
    )
  }

  return (
    <Box sx={{ height: '100%', minHeight: 0 }}>
      <List
        rowComponent={VirtualizedSpecimenRow}
        rowCount={visibleItems.length}
        rowHeight={dynamicRowHeight}
        rowProps={itemData}
        rowKey={getRowKey}
        defaultHeight={ESTIMATED_ROW_HEIGHT * 2}
        overscanCount={OVERSCAN_COUNT}
        style={{ height: '100%', width: '100%' }}
      />
    </Box>
  )
}

export default VirtualizedSpecimenList
