import { useState } from 'react'
import ModalContainer from '../ModalContainer'
import PrepareScanModalContentTemplate from './steps/PrepareScanModalContentTemplate'
import PrepareScanModalContentPreparation from './steps/PrepareScanModalContentPreparation'
import PrepareScanModalContentVolumes from './steps/PrepareScanModalContentVolumes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { defaultScanSettings, TScanTemplateSettings } from './schemas'
import Typography from '@mui/material/Typography'

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  volumeId: string
}

const PrepareScanModal = ({ isOpen, setIsOpen, volumeId }: Props) => {
  // TODO default step needs to be fetched from BE
  const [step, setStep] = useState<number>(0)
  const [scanTemplateSettings, setScanTemplateSettings] =
    // TODO scan settings need to be fetched from BE
    useState<TScanTemplateSettings>(defaultScanSettings)

  const nextStep = () => {
    // TODO validace?
    setStep((prev) => prev + 1)
  }

  const previousStep = () => {
    // TODO validace?
    setStep((prev) => prev - 1)
  }

  // TODO doplnit do BE struktury ty scan settings atd, abych to mel kde uloziti

  return (
    <ModalContainer
      autoWidth
      minWidth="40rem"
      maxHeight="95vh"
      header={`Příprava pro skenování - ${step === 0 ? 'příprava' : step === 1 ? 'výběr svazků' : 'předloha'}`}
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      closeButton={{ callback: () => setIsOpen(false) }}
      customDialogActions={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
          }}
        >
          <Box
            sx={{
              width: '10rem',
            }}
          >
            {step > 0 ? (
              <Button fullWidth variant="outlined" onClick={previousStep}>
                Předchozí krok
              </Button>
            ) : (
              <Box />
            )}
          </Box>
          <Typography>{step + 1} / 3</Typography>
          <Box
            sx={{
              width: '10rem',
            }}
          >
            {step < 2 ? (
              <Button fullWidth variant="outlined" onClick={nextStep}>
                Další krok
              </Button>
            ) : (
              <div />
            )}
          </Box>
        </Box>
      }
    >
      {step === 0 && (
        <PrepareScanModalContentPreparation
          setTemplateSettings={setScanTemplateSettings}
          templateSettings={scanTemplateSettings}
        />
      )}
      {step === 1 && (
        <PrepareScanModalContentVolumes
          setTemplateSettings={setScanTemplateSettings}
          templateSettings={scanTemplateSettings}
        />
      )}
      {step === 2 && (
        <PrepareScanModalContentTemplate
          setTemplateSettings={setScanTemplateSettings}
          templateSettings={scanTemplateSettings}
        />
      )}
    </ModalContainer>
  )
}

export default PrepareScanModal
