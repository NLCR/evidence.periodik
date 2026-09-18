import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Barcode from 'react-barcode'
import type { TTemplateItem } from '@/components/prepare-scan-modal/schemas/schemas'
import SpecimenItemViewOnly from '../components/specimen-item/SpecimenItemViewOnly'
import GroupedTemplateSections from '../grouped-by-volumes/GroupedTemplateSections'
import { type TTemplateVolume } from '../../../schemas/templateSchema'
import TemplatePreviewHeader from './TemplatePreviewHeader'
import { filterTemplateItemsForPrint } from '../utils/filters'
import { getMainReplacement } from '../utils/templateItemLocking'

type Props = {
  primaryVolume: TTemplateVolume
  barCode?: string
  items: TTemplateItem[]
  showOnlyRescans: boolean
  showOnlyUnlocked: boolean
  groupByVolumes: boolean
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
                  mainReplacement={getMainReplacement(item)}
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
