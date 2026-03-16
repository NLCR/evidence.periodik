import React, { ReactNode, useState } from 'react'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import DuplicateVolumeModal from './DuplicateVolumeModal'
import { generateVolumeUrlWithParams } from '../utils/generateVolumeUrlWithParams'
import { FieldsToReset } from '../utils/duplicateVolume/types'

type Props = {
  volumeId?: string | null
  metaTitleId?: string | null
  specimenId?: string | null
  startIcon?: ReactNode
  fullWidth?: boolean
  variant?: 'contained' | 'outlined' | 'text'
  disabled?: boolean
  buttonText?: string
  onDuplicate?: (fieldsToReset: FieldsToReset[]) => Promise<void>
}

const DuplicateVolumeButton: React.FC<Props> = ({
  volumeId = null,
  metaTitleId = null,
  specimenId = null,
  startIcon = null,
  fullWidth = false,
  variant = 'contained',
  disabled = false,
  buttonText = '',
  onDuplicate = undefined,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleDuplicate = async (fieldsToReset: FieldsToReset[]) => {
    setIsOpen(false)
    if (onDuplicate) {
      await onDuplicate(fieldsToReset)
      return
    }

    navigate(
      generateVolumeUrlWithParams(
        `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/duplicated`,
        metaTitleId || '',
        specimenId || undefined,
        volumeId || undefined,
        fieldsToReset
      )
    )
  }

  return (
    <>
      <Button
        variant={variant}
        fullWidth={fullWidth}
        startIcon={startIcon}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        {buttonText || t('administration.duplicate_volume')}
      </Button>
      <DuplicateVolumeModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        doDuplicate={handleDuplicate}
      />
    </>
  )
}

export default DuplicateVolumeButton
