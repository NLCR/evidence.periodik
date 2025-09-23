import { useTranslation } from 'react-i18next'
import { cloneElement, ReactElement, ReactNode, useState } from 'react'
import { ButtonProps } from '@mui/material/Button'
import ModalContainer from '../../../../components/ModalContainer'

type Props = {
  title: string
  description?: ReactNode
  onConfirm: () => void
  TriggerButton: ReactElement<ButtonProps>
  confirmLabel?: string
  refuseLabel?: string
}

const ConfirmDialog = ({
  TriggerButton,
  onConfirm,
  title,
  description = null,
  confirmLabel = undefined,
  refuseLabel = undefined,
}: Props) => {
  const { t } = useTranslation('global')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {cloneElement(TriggerButton, {
        onClick: () => setIsOpen(true),
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
          callback: () => {
            onConfirm()
            setIsOpen(false)
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
