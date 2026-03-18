import { useEffect, useState } from 'react'
import ModalContainer from '../ModalContainer'
import PrepareScanModalContentTemplate from './steps/template/PrepareScanModalContentTemplate'
import PrepareScanModalContentPreparation from './steps/preparation/PrepareScanModalContentPreparation'
import PrepareScanModalContentVolumes from './steps/volumes/PrepareScanModalContentVolumes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { defaultScanSettings, TScanTemplateSettings } from './schemas'
import Typography from '@mui/material/Typography'
import { FormProvider, useForm } from 'react-hook-form'
import { useVolumeTemplateSettingsQuery } from '../../api/volumeTemplateSettings'
import Loader from '../Loader'
import ShowError from '../ShowError'

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  volumeId: string
}

const PrepareScanModal = ({ isOpen, setIsOpen, volumeId }: Props) => {
  // TODO doplnit do BE struktury ty scan settings atd, abych to mel kde uloziti
  // TODO default step needs to be fetched from BE
  const [step, setStep] = useState<number>(0)
  const methods = useForm<TScanTemplateSettings>({
    defaultValues: defaultScanSettings,
  })
  const { reset } = methods
  const {
    data: volumeTemplateSettings,
    isLoading,
    isError,
  } = useVolumeTemplateSettingsQuery(volumeId)

  useEffect(() => {
    if (!volumeTemplateSettings) return
    reset(volumeTemplateSettings)
  }, [reset, volumeTemplateSettings])

  const nextStep = () => {
    // TODO validace?
    setStep((prev) => prev + 1)
  }

  const previousStep = () => {
    // TODO validace?
    setStep((prev) => prev - 1)
  }

  if (isLoading) return <Loader />
  if (isError) return <ShowError />

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
      <FormProvider {...methods}>
        {step === 0 && <PrepareScanModalContentPreparation />}
        {step === 1 && <PrepareScanModalContentVolumes volumeId={volumeId} />}
        {step === 2 && <PrepareScanModalContentTemplate volumeId={volumeId} />}
      </FormProvider>
    </ModalContainer>
  )
}

export default PrepareScanModal
