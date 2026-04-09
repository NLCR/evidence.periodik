import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Barcode from 'react-barcode'
import { TTemplateItem } from '../../schemas/schemas'
import { getVisibleTemplateItems } from './templateGrouping'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import SpecimenItem from './SpecimenItem'
import GroupedTemplateSections from './grouped-by-volumes/GroupedTemplateSections'

type Props = {
  header: TTemplatePreviewHeaderProps
  barCode?: string
  items: TTemplateItem[]
  showOnlyRescans: boolean
  groupByVolumes: boolean
}

export const filterTemplateItemsForPrint = (
  items: TTemplateItem[],
  showOnlyRescans: boolean
) => getVisibleTemplateItems(items, showOnlyRescans).map(({ item }) => item)

const PrepareScanTemplatePrintContent: FC<Props> = ({
  header,
  barCode = undefined,
  items,
  showOnlyRescans,
  groupByVolumes,
}) => {
  const { t } = useTranslation()

  const visibleItems = useMemo(
    () => getVisibleTemplateItems(items, showOnlyRescans),
    [items, showOnlyRescans]
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
            items={items}
            showOnlyRescans={showOnlyRescans}
            compact
          />
        ) : (
          <Box>
            {visibleItems.map(({ item, formIndex }) => (
              <Box
                key={item.specimen.id}
                sx={{
                  mb: 1,
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                }}
              >
                <SpecimenItem
                  specimen={item.specimen}
                  itemPath={`items.${formIndex}`}
                  viewOnly
                  showOnlyRescans={showOnlyRescans}
                  replacementSourceCandidates={[]}
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
