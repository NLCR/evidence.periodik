import { useEffect, useState } from 'react'
import ModalContainer from '../ModalContainer'
import PrepareScanModalContentTemplate from './steps/template/PrepareScanModalContentTemplate'
import PrepareScanModalContentPreparation from './steps/preparation/PrepareScanModalContentPreparation'
import PrepareScanModalContentVolumes from './steps/volumes/PrepareScanModalContentVolumes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import {
  defaultScanSettings,
  TemplateState,
  TScanTemplateSettings,
  TTemplate,
} from './schemas/schemas'
import Typography from '@mui/material/Typography'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  useSaveVolumeTemplateSettingsMutation,
  useVolumeTemplateSettingsQuery,
} from '../../api/volumeTemplateSettings'
import Loader from '../Loader'
import ShowError from '../ShowError'
import {
  useSaveVolumeTemplateMutation,
  useVolumeTemplateQuery,
} from '../../api/volumeTemplate'
import ConfirmDialog from '../../pages/specimensOverview/components/dialogs/ConfirmDialog'

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  volumeId: string
}

const PrepareScanModal = ({ isOpen, setIsOpen, volumeId }: Props) => {
  const { t } = useTranslation()
  // TODO doplnit do BE struktury ty scan settings atd, abych to mel kde uloziti
  // TODO default step needs to be fetched from BE
  const [step, setStep] = useState<number>(0)
  const settingsMethods = useForm<TScanTemplateSettings>({
    defaultValues: defaultScanSettings,
  })
  const templateMethods = useForm<TTemplate>()
  const { reset: resetSettings } = settingsMethods
  const { reset: resetTemplate, getValues: getTemplateValues } = templateMethods

  const {
    data: volumeTemplateSettings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = useVolumeTemplateSettingsQuery(volumeId)
  const {
    data: volumeTemplate,
    isLoading: templateLoading,
    isError: templateError,
  } = useVolumeTemplateQuery(volumeId, { enabled: step === 2 })
  const saveSettingsMutation = useSaveVolumeTemplateSettingsMutation(volumeId)
  const saveTemplateMutation = useSaveVolumeTemplateMutation(volumeId)

  const replacementSources = settingsMethods.watch('replacementSources')

  useEffect(() => {
    if (!volumeTemplateSettings) return
    resetSettings(volumeTemplateSettings)
  }, [resetSettings, volumeTemplateSettings])

  useEffect(() => {
    if (!volumeTemplate) return
    resetTemplate(volumeTemplate)
  }, [resetTemplate, volumeTemplate])

  const nextStep = async () => {
    // TODO validace?
    if (step === 1) {
      try {
        await saveSettingsMutation.mutateAsync(settingsMethods.getValues())
      } catch {
        return
      }
    }

    setStep((prev) => prev + 1)
  }

  const previousStep = () => {
    // TODO validace?
    setStep((prev) => prev - 1)
  }

  if (settingsLoading || templateLoading) return <Loader />
  if (settingsError || templateError) return <ShowError />

  const stepTitle =
    step === 0
      ? t('prepare_scan_modal.wizard.step_preparation')
      : step === 1
        ? t('prepare_scan_modal.wizard.step_volumes')
        : t('prepare_scan_modal.wizard.step_template')

  return (
    <ModalContainer
      minWidth="40rem"
      maxHeight="95vh"
      height={step === 0 ? 'fit-content' : '95vh'}
      width={step === 0 ? 'fit-content' : '80vw'}
      header={`${t('prepare_scan_modal.wizard.title')} - ${stepTitle}`}
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
            {step === 2 ? (
              <ConfirmDialog
                title={t('prepare_scan_modal.back_warning.title')}
                description={t('prepare_scan_modal.back_warning.message')}
                onConfirm={previousStep}
                TriggerButton={
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={volumeTemplate?.state !== TemplateState.CREATED}
                  >
                    {t('prepare_scan_modal.wizard.previous_step')}
                  </Button>
                }
                confirmLabel={t(
                  'prepare_scan_modal.back_warning.proceed_button'
                )}
                refuseLabel={t('prepare_scan_modal.back_warning.stay_button')}
              />
            ) : step > 0 ? (
              <Button fullWidth variant="outlined" onClick={previousStep}>
                {t('prepare_scan_modal.wizard.previous_step')}
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
              <Button
                fullWidth
                variant="outlined"
                onClick={nextStep}
                disabled={step === 1 && saveSettingsMutation.isPending}
              >
                {t('prepare_scan_modal.wizard.next_step')}
              </Button>
            ) : step === 2 ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => saveTemplateMutation.mutate(getTemplateValues())}
                disabled={saveTemplateMutation.isPending}
              >
                {t('prepare_scan_modal.wizard.save_template')}
              </Button>
            ) : (
              <div />
            )}
          </Box>
        </Box>
      }
    >
      {(step === 0 || step === 1) && (
        <FormProvider {...settingsMethods}>
          {step === 0 && <PrepareScanModalContentPreparation />}
          {step === 1 && <PrepareScanModalContentVolumes volumeId={volumeId} />}
        </FormProvider>
      )}

      {step === 2 && (
        <FormProvider {...templateMethods}>
          <PrepareScanModalContentTemplate
            replacementSources={replacementSources}
          />
        </FormProvider>
      )}
    </ModalContainer>
  )
}

export default PrepareScanModal
