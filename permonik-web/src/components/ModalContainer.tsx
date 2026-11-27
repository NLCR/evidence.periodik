import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { type FC, type ReactNode } from 'react'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import isFunction from 'lodash/isFunction'
import theme from '../theme'

const sharedStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'background.paper',
  borderRadius: '4px',
  boxShadow: 24,
  padding: '16px 24px 24px',
  display: 'flex',
  flexDirection: 'column',
}

const fittedStyle = (
  minWidth?: string,
  maxWidth?: string,
  maxHeight?: string,
  width?: string,
  height?: string
) => ({
  height: height ?? 'fit-content',
  maxHeight: maxHeight ?? '80vh',
  width: width ?? 'fit-content',
  maxWidth: { xs: '100%', sm: maxWidth ?? '90vw' },
  minWidth: { xs: '95vw', sm: minWidth ?? '25vw' },
  ...sharedStyle,
})

const scrollableStyle = (
  autoWidth: boolean,
  minWidth?: string,
  maxHeight?: string,
  maxWidth?: string,
  width?: string,
  height?: string
) => ({
  height: height ?? 'fit-content',
  maxHeight: maxHeight ?? '80vh',
  width: width ?? (autoWidth ? 'auto' : '90vw'),
  minWidth: { xs: '95vw', sm: minWidth ?? '25vw' },
  maxWidth: { xs: '100%', sm: maxWidth ?? '1200px' },
  ...sharedStyle,
})

type TModalContainerProps = {
  // Titulek v hlavicce modalu.
  header: string
  // Obsah tela modalu.
  children?: ReactNode
  // Ovlada otevreni/zavreni modalu.
  opened: boolean
  // Callback pro zavreni (klik mimo, ESC, close ikona).
  onClose: () => void
  // Primarni close tlacitko ve footeru.
  closeButton: {
    callback: () => void
    text?: string
  }
  // Volitelne potvrzovaci tlacitko ve footeru.
  acceptButton?: {
    disabled?: boolean
    callback: () => void
    text?: string
  }
  // Prohodi poradi close/accept tlacitek.
  switchButtons?: boolean
  // Zobrazi/skryje defaultni footer tlacitka.
  showButtons?: boolean
  // Rezim layoutu kontejneru.
  style?: 'fitted' | 'scrollable'
  // U scrollable rezimu prepina automatickou sirku.
  autoWidth?: boolean
  // Maximalni vyska kontejneru (napr. 80vh).
  maxHeight?: string
  // Minimalni sirka kontejneru pro >= sm breakpoint.
  minWidth?: string
  // Maximalni sirka kontejneru pro >= sm breakpoint.
  maxWidth?: string
  // Explicitni sirka kontejneru (prepise default vypocet sirky).
  width?: string
  // Explicitni vyska kontejneru (prepise default vypocet vysky).
  height?: string
  // Vlastni akce ve footeru misto defaultnich tlacitek.
  customDialogActions?: ReactNode
}

const ModalContainer: FC<TModalContainerProps> = ({
  header,
  children = null,
  opened,
  onClose,
  closeButton,
  acceptButton = undefined,
  switchButtons = false,
  showButtons = true,
  style = 'scrollable',
  autoWidth = false,
  minWidth = undefined,
  maxHeight = undefined,
  width = undefined,
  height = undefined,
  customDialogActions = null,
  maxWidth = undefined,
}) => {
  const { t } = useTranslation()

  return opened ? (
    <Modal
      open={opened}
      onClose={onClose}
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          color: '#fff',
          timeout: 500,
        },
      }}
    >
      <Box
        sx={
          style === 'scrollable'
            ? scrollableStyle(
                autoWidth,
                minWidth,
                maxHeight,
                maxWidth,
                width,
                height
              )
            : fittedStyle(minWidth, maxWidth, maxHeight, width, height)
        }
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '8px',
          }}
        >
          <Typography
            sx={{
              color: theme.palette.primary.main,
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {header}
          </Typography>
          <IconButton onClick={() => onClose()}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            overflowY: style === 'scrollable' ? 'auto' : 'hidden',
            paddingRight: style === 'scrollable' ? '16px' : '0px',
            flexGrow: 1,
          }}
        >
          {children}
        </Box>

        {customDialogActions ? (
          customDialogActions
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '12px',
              marginTop: style === 'scrollable' ? 'auto' : '16px',
              paddingTop: '8px',
              backgroundColor: 'background.paper',
            }}
          >
            {showButtons ? (
              <>
                <Button
                  onClick={() => closeButton.callback()}
                  variant="outlined"
                  sx={{ order: switchButtons ? '2' : '1' }}
                >
                  {closeButton?.text ? closeButton.text : t('common.close')}
                </Button>
                {isFunction(acceptButton?.callback) ? (
                  <Button
                    disabled={acceptButton.disabled}
                    onClick={() => acceptButton.callback()}
                    variant="contained"
                  >
                    {acceptButton?.text
                      ? acceptButton.text
                      : t('common.accept')}
                  </Button>
                ) : null}
              </>
            ) : null}
          </Box>
        )}
      </Box>
    </Modal>
  ) : null
}

export default ModalContainer
