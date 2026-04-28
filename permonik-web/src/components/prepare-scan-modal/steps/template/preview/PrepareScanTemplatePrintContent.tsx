import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Barcode from 'react-barcode'
import type { TTemplateItem } from '@/components/prepare-scan-modal/schemas/schemas'
import { getVisibleTemplateItems } from '../templateGrouping'
import { applyExportVisibilityToTemplateItems } from '../templateExportVisibility'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import SpecimenItemViewOnly from '../components/specimen-item/SpecimenItemViewOnly'
import GroupedTemplateSections from '../grouped-by-volumes/GroupedTemplateSections'

type Props = {
  header: TTemplatePreviewHeaderProps
  barCode?: string
  items: TTemplateItem[]
  showOnlyRescans: boolean
  showOnlyUnlocked: boolean
  groupByVolumes: boolean
}

export const filterTemplateItemsForPrint = (
  items: TTemplateItem[],
  showOnlyRescans: boolean,
  showOnlyUnlocked: boolean
) => {
  const filteredItems = getVisibleTemplateItems(
    items,
    showOnlyRescans,
    showOnlyUnlocked
  )

  return filteredItems.flatMap(({ item, formIndex }) => {
    const visibleItems = applyExportVisibilityToTemplateItems([item])

    return visibleItems.map((visibleItem) => ({
      item: visibleItem,
      formIndex,
    }))
  })
}

const PrepareScanTemplatePrintContent: FC<Props> = ({
  header,
  barCode = undefined,
  items,
  showOnlyRescans,
  showOnlyUnlocked,
  groupByVolumes,
}) => {
  const { t } = useTranslation()

  const visibleItems = useMemo(
    () => filterTemplateItemsForPrint(items, showOnlyRescans, showOnlyUnlocked),
    [items, showOnlyRescans, showOnlyUnlocked]
  )

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        width: '100%',
        maxWidth: '1080px',
        p: 2,
        '@media print': {
          p: 4,
          maxWidth: '100%',
        },
      }}
    >
      <TemplatePreviewHeader {...header} />

      {barCode ? (
        <Box
          display="flex"
          justifyContent="center"
          marginTop={1}
          marginBottom={2}
        >
          <Barcode value={barCode} />
        </Box>
      ) : null}

      {visibleItems.length > 0 ? (
        groupByVolumes ? (
          <GroupedTemplateSections
            items={visibleItems.map(({ item }) => item)}
            showOnlyRescans={false}
            showOnlyUnlocked={false}
            compact
          />
        ) : (
          <Box>
            {visibleItems.map(({ item }) => (
              <Box
                key={item.specimen.id}
                sx={{
                  mb: 1,
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                }}
              >
                <SpecimenItemViewOnly
                  specimen={item.specimen}
                  mainReplacement={item.replacement ?? null}
                  replacementRows={item.pageReplacements.map(
                    (replacement, replacementIndex) => ({
                      replacement,
                      replacementIndex,
                      isVisible: true,
                    })
                  )}
                  itemVisible
                  note={item.note ?? ''}
                />
              </Box>
            ))}
          </Box>
        )
      ) : (
        <Typography>
          {t('prepare_scan_modal.content_template.no_items')}
        </Typography>
      )}
    </Box>
  )
}

export default PrepareScanTemplatePrintContent
