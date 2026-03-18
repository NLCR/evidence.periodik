import Box from '@mui/material/Box'
import { FC } from 'react'
import Barcode from 'react-barcode'
import { TSpecimen } from '../../../../schema/specimen'
import ModalContainer from '../../../ModalContainer'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'

type Props = {
  opened: boolean
  onClose: () => void
  header: TTemplatePreviewHeaderProps
  barCode?: string
  items: TSpecimen[]
}

const PrepareScanTemplatePreviewDialog: FC<Props> = ({
  opened,
  onClose,
  header,
  barCode = undefined,
  items,
}) => {
  return (
    <ModalContainer
      opened={opened}
      onClose={onClose}
      header="Náhled předlohy"
      closeButton={{ callback: onClose }}
      minWidth="40rem"
      autoWidth
      maxHeight="95vh"
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

      <VirtualizedSpecimenList items={items} viewOnly />
    </ModalContainer>
  )
}

export default PrepareScanTemplatePreviewDialog
