import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { type FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
// eslint-disable-next-line import/no-unresolved -- eslint resolver v projektu neumi spravne rozpoznat export react-to-print
import { useReactToPrint } from 'react-to-print'
import Barcode from 'react-barcode'
import ModalContainer from '@/components/ModalContainer'
import VirtualizedSpecimenList from '../VirtualizedSpecimenList'
import PrepareScanTemplatePrintContent from './PrepareScanTemplatePrintContent'
import GroupedTemplateSections from '../grouped-by-volumes/GroupedTemplateSections'
import { type TTemplateVolume } from '../../../schemas/templateSchema'
import { type TTemplateItem } from '@/components/prepare-scan-modal/schemas/templateSchema'
import TemplatePreviewHeader from './TemplatePreviewHeader'

type Props = {
  opened: boolean
  onClose: () => void
  primaryVolume: TTemplateVolume
  barCode?: string
  items: TTemplateItem[]
  showOnlyRescans: boolean
  showOnlyUnlocked: boolean
}

const PrepareScanTemplatePreviewDialog: FC<Props> = ({
  opened,
  onClose,
  barCode = undefined,
  primaryVolume,
  items,
  showOnlyRescans,
  showOnlyUnlocked,
}) => {
  const { t } = useTranslation()
  const printContentRef = useRef<HTMLDivElement>(null)
  const [groupByVolumes, setGroupByVolumes] = useState(false)

  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: primaryVolume?.metaTitleName ?? '-',
  })

  return (
    <ModalContainer
      opened={opened}
      onClose={onClose}
      header={t('prepare_scan_modal.content_template.preview_dialog_title')}
      closeButton={{ callback: onClose }}
      minWidth="40rem"
      autoWidth
      maxHeight="95vh"
      height="95vh"
      customDialogActions={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Button variant="outlined" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
          >
            {t('prepare_scan_modal.content_template.export_button')}
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            marginBottom: '10px',
          }}
        >
          <TemplatePreviewHeader items={items} primaryVolume={primaryVolume} />

          {barCode ? (
            <Box display="flex" justifyContent="center" marginTop={1}>
              <Barcode value={barCode} />
            </Box>
          ) : null}

          <FormControlLabel
            control={
              <Checkbox
                checked={groupByVolumes}
                onChange={(_, checked) => setGroupByVolumes(checked)}
              />
            }
            label={t('prepare_scan_modal.content_template.group_by_volumes')}
          />
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {groupByVolumes ? (
            <GroupedTemplateSections
              items={items}
              showOnlyRescans={showOnlyRescans}
              showOnlyUnlocked={showOnlyUnlocked}
            />
          ) : (
            <VirtualizedSpecimenList
              items={items}
              viewOnly
              showOnlyRescans={showOnlyRescans}
              showOnlyUnlocked={showOnlyUnlocked}
            />
          )}
        </Box>

        {/* Print Content has to be visible only when printing, has to be in DOM */}
        <Box
          ref={printContentRef}
          aria-hidden
          sx={{
            display: 'none',
            '@media print': {
              display: 'block',
              position: 'static',
              width: '100%',
              opacity: 1,
              pointerEvents: 'auto',
            },
          }}
        >
          <PrepareScanTemplatePrintContent
            primaryVolume={primaryVolume}
            barCode={barCode}
            items={items}
            showOnlyRescans={showOnlyRescans}
            showOnlyUnlocked={showOnlyUnlocked}
            groupByVolumes={groupByVolumes}
          />
        </Box>
      </Box>
    </ModalContainer>
  )
}

export default PrepareScanTemplatePreviewDialog
