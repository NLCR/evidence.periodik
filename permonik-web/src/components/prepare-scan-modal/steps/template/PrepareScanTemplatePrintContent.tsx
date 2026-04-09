import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Barcode from 'react-barcode'
import { TTemplateItem } from '../../schemas/schemas'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import SpecimenItem from './SpecimenItem'

type Props = {
  header: TTemplatePreviewHeaderProps
  barCode?: string
  items: TTemplateItem[]
  showOnlyRescans: boolean
  groupByVolumes: boolean
}

type TVisibleItem = {
  item: TTemplateItem
  formIndex: number
}

const shouldIncludeTemplateItemForPrint = (
  item: TTemplateItem,
  showOnlyRescans: boolean
) =>
  showOnlyRescans
    ? !!item.replacement?.isWaitingForRescan ||
      item.pageReplacements.some(
        (replacement) => replacement.isWaitingForRescan
      )
    : true

export const filterTemplateItemsForPrint = (
  items: TTemplateItem[],
  showOnlyRescans: boolean
) =>
  items.filter((item) =>
    shouldIncludeTemplateItemForPrint(item, showOnlyRescans)
  )

const PrepareScanTemplatePrintContent: FC<Props> = ({
  header,
  barCode = undefined,
  items,
  showOnlyRescans,
}) => {
  const { t } = useTranslation()

  const visibleItems = useMemo<TVisibleItem[]>(
    () =>
      items
        .map((item, formIndex) => ({ item, formIndex }))
        .filter(({ item }) =>
          shouldIncludeTemplateItemForPrint(item, showOnlyRescans)
        ),
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
      ) : (
        <Typography>
          {t('prepare_scan_modal.content_template.no_items')}
        </Typography>
      )}
    </Box>
  )
}

export default PrepareScanTemplatePrintContent
