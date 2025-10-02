import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import React, { FC, ReactNode } from 'react'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import { blue } from '@mui/material/colors'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import isFunction from 'lodash/isFunction'

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

const fittedStyle = {
  height: 'fit-content',
  maxHeight: '80vh',
  width: 'fit-content',
  maxWidth: '90vw',
  ...sharedStyle,
}

const scrollableStyle = (autoWidth: boolean, minWidth?: string) => ({
  maxHeight: '800px',
  height: '80vh',
  maxWidth: { xs: '100%', sm: '1200px' },
  width: autoWidth ? 'auto' : '90vw',
  minWidth: { xs: '95vw', sm: minWidth ?? '25vw' },
  ...sharedStyle,
})

type TModalContainerProps = {
  header: string
  children?: ReactNode
  opened: boolean
  onClose: () => void
  closeButton: {
    callback: () => void
    text?: string
  }
  acceptButton?: {
    disabled?: boolean
    callback: () => void
    text?: string
  }
  switchButtons?: boolean
  showButtons?: boolean
  style?: 'fitted' | 'scrollable'
  autoWidth?: boolean
  minWidth?: string
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
            ? scrollableStyle(autoWidth, minWidth)
            : fittedStyle
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
              color: blue['900'],
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
          }}
        >
          {children}
        </Box>
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
                  {acceptButton?.text ? acceptButton.text : t('common.accept')}
                </Button>
              ) : null}
            </>
          ) : null}
        </Box>
      </Box>
    </Modal>
  ) : null
}

export default ModalContainer
