import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Barcode from 'react-barcode'
import type { TTemplateItem } from '@/components/prepare-scan-modal/schemas/schemas'
import { getFilteredTemplateItems } from '../templateGrouping'
import SpecimenItemViewOnly from '../components/specimen-item/SpecimenItemViewOnly'
import GroupedTemplateSections from '../grouped-by-volumes/GroupedTemplateSections'
import { TVolume } from '@/schema/volume'
import TemplatePreviewHeader from './TemplatePreviewHeader'

type Props = {
  primaryVolume: TVolume
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
  const filteredItems = getFilteredTemplateItems(
    items,
    showOnlyRescans,
    showOnlyUnlocked
  )

  return filteredItems
    .filter((item) => item.item.visible)
    .map((item) => ({
      ...item.item,
      pageReplacements: item.item.pageReplacements.filter((r) => r.visible),
    }))
}

const PrepareScanTemplatePrintContent: FC<Props> = ({
  primaryVolume,
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
      <TemplatePreviewHeader
        primaryVolume={primaryVolume}
        items={visibleItems}
      />

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
            items={visibleItems}
            showOnlyRescans={false}
            showOnlyUnlocked={false}
            compact
          />
        ) : (
          <Box>
            {visibleItems.map((item) => (
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
                    })
                  )}
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
