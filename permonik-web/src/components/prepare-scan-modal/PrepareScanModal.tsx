import { useState } from 'react'
import ModalContainer from '../ModalContainer'
import PrepareScanModalContentTemplate from './steps/PrepareScanModalContentTemplate'
import PrepareScanModalContentPreparation from './steps/PrepareScanModalContentPreparation'
import PrepareScanModalContentVolumes from './steps/PrepareScanModalContentVolumes'
import Box from '@mui/material/Box'

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  volumeId: string
}

const PrepareScanModal = ({ isOpen, setIsOpen, volumeId }: Props) => {
  // TODO default step needs to be fetched from BE
  const [step, setStep] = useState<number>(0)
  // settings state
  // volume state
  // TODO doplnit do BE struktury

  return (
    <ModalContainer
      autoWidth
      minWidth="40rem"
      maxHeight="95vh"
      header={`Příprava pro skenování - ${step === 0 ? 'příprava' : step === 1 ? 'výběr svazků' : 'předloha'}`}
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      closeButton={{ callback: () => setIsOpen(false) }}
      customDialogActions={<Box>TODO hehe</Box>}
    >
      {step === 0 && (
        <PrepareScanModalContentPreparation
        //   nextStepCallback={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <PrepareScanModalContentVolumes
        //   previousStepCallback={() => setStep(0)}
        //   nextStepCallback={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <PrepareScanModalContentTemplate
        //   previousStepCallback={() => setStep(1)}
        />
      )}
      {/* <PrepareScanModalContent volumeId={volumeId} /> */}
    </ModalContainer>
  )
}

export default PrepareScanModal
