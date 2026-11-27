import { useTranslation } from 'react-i18next'
import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react'
import { type ButtonProps } from '@mui/material/Button'
import ModalContainer from '../../../../components/ModalContainer'

type Props = {
  title: string
  description?: ReactNode
  onConfirm: () => boolean | Promise<boolean>
  onOpen?: () => void
  TriggerButton: ReactElement<ButtonProps>
  confirmLabel?: string
  refuseLabel?: string
}

const ConfirmDialog = ({
  TriggerButton,
  onConfirm,
  title,
  description = null,
  onOpen = undefined,
  confirmLabel = undefined,
  refuseLabel = undefined,
}: Props) => {
  const { t } = useTranslation('global')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {cloneElement(TriggerButton, {
        onClick: () => {
          onOpen?.()
          setIsOpen(true)
        },
      })}

      <ModalContainer
        style="fitted"
        header={title}
        opened={isOpen}
        onClose={() => setIsOpen(false)}
        closeButton={{
          callback: () => setIsOpen(false),
          text: refuseLabel ?? t('common.no'),
        }}
        acceptButton={{
          callback: async () => {
            if (await onConfirm()) {
              setIsOpen(false)
            }
          },
          text: confirmLabel ?? t('common.yes'),
        }}
      >
        {description}
      </ModalContainer>
    </>
  )
}

export default ConfirmDialog
