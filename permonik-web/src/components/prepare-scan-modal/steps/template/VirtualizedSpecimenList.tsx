import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { List, useDynamicRowHeight, useListRef } from 'react-window'
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
  validationPath?: string
  validationAttempt?: number
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
  validationPath = undefined,
  validationAttempt = 0,
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
  const listRef = useListRef()
  const pendingValidationPath = useRef<string | undefined>(undefined)
  const errorItemIndex = useMemo(() => {
    const match = validationPath?.match(/^items\.(\d+)(?:\.|$)/)
    if (!match) return -1

    return visibleItems.findIndex(
      ({ formIndex }) => formIndex === Number(match[1])
    )
  }, [validationPath, visibleItems])

  const focusValidationTarget = useCallback(() => {
    const path = pendingValidationPath.current
    const listElement = listRef.current?.element
    if (!path || !listElement) return false

    const target = Array.from(
      listElement.querySelectorAll<HTMLElement>('[data-validation-path]')
    ).find((element) => element.dataset.validationPath === path)
    if (!target) return false

    const focusable = target.matches(
      'input, textarea, button, [role="combobox"], [tabindex]:not([tabindex="-1"])'
    )
      ? target
      : target.querySelector<HTMLElement>(
          'input, textarea, button, [role="combobox"], [tabindex]:not([tabindex="-1"])'
        )
    if (!focusable) return false

    const listRect = listElement.getBoundingClientRect()
    const targetRect = focusable.getBoundingClientRect()
    const scrollDelta =
      targetRect.top < listRect.top
        ? targetRect.top - listRect.top
        : targetRect.bottom > listRect.bottom
          ? targetRect.bottom - listRect.bottom
          : 0

    if (scrollDelta !== 0) {
      listElement.scrollTo({
        top: listElement.scrollTop + scrollDelta,
        behavior: 'instant',
      })
    }

    focusable?.focus({ preventScroll: true })
    pendingValidationPath.current = undefined
    return true
  }, [listRef])

  const handleRowsRendered = useCallback(() => {
    focusValidationTarget()
  }, [focusValidationTarget])

  useEffect(() => {
    if (!validationPath || errorItemIndex < 0) return

    pendingValidationPath.current = validationPath
    listRef.current?.scrollToRow({
      index: errorItemIndex,
      align: 'auto',
      behavior: 'instant',
    })

    let frame = 0
    const retryFocus = () => {
      if (!pendingValidationPath.current || focusValidationTarget()) return
      if (frame++ < 10) window.requestAnimationFrame(retryFocus)
    }
    window.requestAnimationFrame(retryFocus)
  }, [
    errorItemIndex,
    focusValidationTarget,
    listRef,
    validationAttempt,
    validationPath,
  ])

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
        listRef={listRef}
        rowComponent={VirtualizedSpecimenRow}
        rowCount={visibleItems.length}
        rowHeight={dynamicRowHeight}
        rowProps={itemData}
        rowKey={getRowKey}
        onRowsRendered={handleRowsRendered}
        onResize={handleRowsRendered}
        defaultHeight={ESTIMATED_ROW_HEIGHT * 2}
        overscanCount={OVERSCAN_COUNT}
        style={{ height: '100%', width: '100%', paddingTop: 2 }}
      />
    </Box>
  )
}

export default VirtualizedSpecimenList
