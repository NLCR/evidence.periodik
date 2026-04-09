import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import { FC, useRef } from 'react'
import { useTranslation } from 'react-i18next'
// eslint-disable-next-line import/no-unresolved -- eslint resolver v projektu neumi spravne rozpoznat export react-to-print
import { useReactToPrint } from 'react-to-print'
import Barcode from 'react-barcode'
import ModalContainer from '../../../ModalContainer'
import { TTemplateItem } from '../../schemas/schemas'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'
import PrepareScanTemplatePrintContent from './PrepareScanTemplatePrintContent'

type Props = {
  opened: boolean
  onClose: () => void
  header: TTemplatePreviewHeaderProps
  barCode?: string
  items: TTemplateItem[]
  showOnlyRescans: boolean
  groupByVolumes: boolean
}

const PrepareScanTemplatePreviewDialog: FC<Props> = ({
  opened,
  onClose,
  header,
  barCode = undefined,
  items,
  showOnlyRescans,
  groupByVolumes,
}) => {
  const { t } = useTranslation()
  const printContentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: header.title,
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
            gap: '12px',
            marginTop: 'auto',
            paddingTop: '8px',
            backgroundColor: 'background.paper',
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
          <TemplatePreviewHeader {...header} />

          {barCode ? (
            <Box display="flex" justifyContent="center" marginTop={1}>
              <Barcode value={barCode} />
            </Box>
          ) : null}
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <VirtualizedSpecimenList
            items={items}
            viewOnly
            showOnlyRescans={showOnlyRescans}
            groupByVolumes={groupByVolumes}
          />
        </Box>

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
            header={header}
            barCode={barCode}
            items={items}
            showOnlyRescans={showOnlyRescans}
            groupByVolumes={groupByVolumes}
          />
        </Box>
      </Box>
    </ModalContainer>
  )
}

export default PrepareScanTemplatePreviewDialog
