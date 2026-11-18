import { useEffect, useState } from 'react'
import ModalContainer from '../ModalContainer'
import PrepareScanModalContentTemplate from './steps/template/PrepareScanModalContentTemplate'
import PrepareScanModalContentPreparation from './steps/preparation/PrepareScanModalContentPreparation'
import PrepareScanModalContentVolumes from './steps/volumes/PrepareScanModalContentVolumes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import {
  createDefaultScanSettings,
  TemplateState,
  type TScanTemplateSettings,
  type TTemplate,
} from './schemas/schemas'
import Typography from '@mui/material/Typography'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Loader from '../Loader'
import ShowError from '../ShowError'
import ConfirmDialog from '../../pages/specimensOverview/components/dialogs/ConfirmDialog'
import {
  useSavePrepareScanTemplateMutation,
  usePrepareScanTemplateQuery,
  useGeneratePrepareScanTemplateMutation,
  withVisible,
} from '@/api/prepareScanModal'

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  volumeId: string
}

const PrepareScanModal = (props: Props) => {
  const templateQuery = usePrepareScanTemplateQuery(props.volumeId, {
    enabled: props.isOpen,
  })

  if (templateQuery.isLoading) return <Loader />
  if (templateQuery.isError) return <ShowError />

  return <PrepareScanWizard {...props} templateQuery={templateQuery} />
}

const PrepareScanWizard = ({
  isOpen,
  setIsOpen,
  volumeId,
  templateQuery,
}: Props & {
  templateQuery: ReturnType<typeof usePrepareScanTemplateQuery>
}) => {
  const { t } = useTranslation()
  const { data: volumeTemplate, refetch: refetchTemplate } = templateQuery
  const [step, setStep] = useState(volumeTemplate ? 2 : 0)
  const settingsMethods = useForm<TScanTemplateSettings>({
    defaultValues: volumeTemplate
      ? {
          issues: volumeTemplate.issues,
          replacementSources: volumeTemplate.replacementSources,
          replacementSourcesParameters:
            volumeTemplate.replacementSourcesParameters,
          primaryVolumeFillIndex: volumeTemplate.primaryVolumeFillIndex,
        }
      : createDefaultScanSettings(),
  })
  const templateMethods = useForm<TTemplate>({
    defaultValues: volumeTemplate ? withVisible(volumeTemplate) : undefined,
  })
  const {
    reset: resetTemplate,
    getValues: getTemplateValues,
    formState: { isDirty: templateIsDirty },
  } = templateMethods
  const state = useWatch({ control: templateMethods.control, name: 'state' })

  const generateTemplateMutation =
    useGeneratePrepareScanTemplateMutation(volumeId)
  const saveTemplateMutation = useSavePrepareScanTemplateMutation(volumeId)

  const replacementSources = useWatch({
    control: settingsMethods.control,
    name: 'replacementSources',
  })

  useEffect(() => {
    if (!volumeTemplate) return
    const currentTemplate = getTemplateValues()
    resetTemplate(
      withVisible(
        volumeTemplate,
        Array.isArray(currentTemplate.items) ? currentTemplate : undefined
      )
    )
  }, [getTemplateValues, resetTemplate, volumeTemplate])

  const nextStep = async () => {
    if (step === 1) {
      try {
        const latestTemplate = (await refetchTemplate()).data
        const template = await generateTemplateMutation.mutateAsync({
          ...settingsMethods.getValues(),
          version: latestTemplate?.version ?? null,
          previousTemplate: latestTemplate ?? undefined,
        })
        resetTemplate(template)
      } catch {
        toast.error(t('common.error_occurred_somewhere'))
        return
      }
    }

    setStep((prev) => prev + 1)
  }

  const previousStep = () => {
    setStep((prev) => prev - 1)
    return true
  }

  const closeAfterDelete = () => {
    setStep(0)
    settingsMethods.reset(createDefaultScanSettings())
    resetTemplate()
    setIsOpen(false)
  }

  const discardTemplateChanges = async () => {
    const result = await refetchTemplate()
    if (result.isError) return false
    resetTemplate(result.data ?? undefined)
    return true
  }

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
      onClose={() => {
        setIsOpen(false)
      }}
      closeButton={{
        callback: () => {
          setIsOpen(false)
        },
      }}
      customDialogActions={
        <Box
          sx={{
            width: '100%',
          }}
        >
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
                      disabled={state !== TemplateState.CREATED}
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
                  disabled={step === 1 && generateTemplateMutation.isPending}
                >
                  {t('prepare_scan_modal.wizard.next_step')}
                </Button>
              ) : step === 2 ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    saveTemplateMutation.mutate(getTemplateValues(), {
                      onSuccess: () => {
                        toast.success(t('common.saved_successfully'))
                      },
                      onError: () => {
                        toast.error(t('common.error_occurred_somewhere'))
                      },
                    })
                  }}
                  disabled={
                    saveTemplateMutation.isPending ||
                    state === TemplateState.FINALIZED
                  }
                >
                  {t('prepare_scan_modal.wizard.save_template')}
                </Button>
              ) : (
                <div />
              )}
            </Box>
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
            volumeId={volumeId}
            replacementSources={replacementSources}
            onDeleted={closeAfterDelete}
            onDiscardChanges={discardTemplateChanges}
            hasUnsavedChanges={templateIsDirty}
          />
        </FormProvider>
      )}
    </ModalContainer>
  )
}

export default PrepareScanModal
