import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { FC, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  TReplacementSource,
  TemplateState,
  TTemplate,
} from '../../schemas/schemas'
import { validateTemplateForTransition } from '../../validators/templateTransitionValidator'
import {
  useSaveVolumeTemplateMutation,
  useUpdateVolumeTemplateStateMutation,
} from '../../../../api/volumeTemplate'
import PrepareScanTemplatePreviewDialog from './PrepareScanTemplatePreviewDialog'
import TemplatePreviewHeader, {
  TTemplatePreviewHeaderProps,
} from './TemplatePreviewHeader'
import VirtualizedSpecimenList from './VirtualizedSpecimenList'

type TProps = {
  volumeId?: string
  replacementSources?: TReplacementSource[]
}

const PrepareScanModalContentTemplate: FC<TProps> = ({
  volumeId = undefined,
  replacementSources = [],
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showOnlyRescans, setShowOnlyRescans] = useState(false)
  const { control, getValues, setValue, trigger, clearErrors, setError } =
    useFormContext<TTemplate>()
  const saveTemplateMutation = useSaveVolumeTemplateMutation(volumeId)
  const updateTemplateStateMutation =
    useUpdateVolumeTemplateStateMutation(volumeId)
  const primaryVolume = useWatch({ control, name: 'primaryVolume' })
  const watchedItems = useWatch({ control, name: 'items' })
  const watchedState = useWatch({ control, name: 'state' })
  const items = useMemo(() => watchedItems ?? [], [watchedItems])

  const headerProps = useMemo<TTemplatePreviewHeaderProps>(
    () => ({
      title: primaryVolume?.metaTitleId ?? '-',
      signature: primaryVolume?.signature,
      subTitle: primaryVolume?.subName,
      owner: primaryVolume?.ownerId,
      mutation: primaryVolume?.mutationId,
      mutationEdition: primaryVolume?.mutationMark.mark ?? undefined,
      dateFrom: primaryVolume?.dateFrom
        ? new Date(primaryVolume.dateFrom).toLocaleDateString()
        : '-',
      dateTo: primaryVolume?.dateTo
        ? new Date(primaryVolume.dateTo).toLocaleDateString()
        : '-',
      specimensCount: items.filter((item) => !item.specimen.attachmentNumber)
        .length,
      attachmentsCount: items.filter((item) => !!item.specimen.attachmentNumber)
        .length,
    }),
    [items, primaryVolume]
  )

  const hasWaitingForRescan = useMemo(
    () =>
      items.some(
        (item) =>
          item.replacement?.isWaitingForRescan ||
          item.pageReplacements.some(
            (replacement) => replacement.isWaitingForRescan
          )
      ),
    [items]
  )

  const validateTemplateForNextState = async (
    nextState: TemplateState.WAITING_FOR_RESCAN | TemplateState.FINALIZED
  ) => {
    const isBaseValid = await trigger()

    if (!isBaseValid) return false

    clearErrors('items')

    const transitionIssues = validateTemplateForTransition(
      getValues(),
      nextState
    )

    if (transitionIssues.length > 0) {
      transitionIssues.forEach((issue) => {
        setError(
          issue.path as `items.${number}` | `items.${number}.replacement`,
          {
            type: 'manual',
            message: issue.message,
          }
        )
      })
      return false
    }

    return true
  }

  const handleValidate = async () => {
    const nextState =
      watchedState === TemplateState.CREATED && hasWaitingForRescan
        ? TemplateState.WAITING_FOR_RESCAN
        : TemplateState.FINALIZED

    await validateTemplateForNextState(nextState)
  }

  const handleCloseToRescanOrFinalize = async () => {
    const nextState =
      watchedState === TemplateState.CREATED && hasWaitingForRescan
        ? TemplateState.WAITING_FOR_RESCAN
        : TemplateState.FINALIZED

    try {
      const isValid = await validateTemplateForNextState(nextState)

      if (!isValid) return

      await saveTemplateMutation.mutateAsync(getValues())
      await updateTemplateStateMutation.mutateAsync(nextState)
      setValue('state', nextState)
    } catch {
      // TODO napojit UI notifikaci chyboveho stavu
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          marginBottom: '10px',
        }}
      >
        <TemplatePreviewHeader
          {...headerProps}
          displayCurrentState
          currentState={watchedState}
        />

        <Box display="flex" justifyContent="space-between" marginTop={0.25}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOnlyRescans}
                  onChange={(_, checked) => setShowOnlyRescans(checked)}
                />
              }
              label="Zobrazit pouze doskeny"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setIsPreviewOpen(true)}>
              Zobrazit náhled
            </Button>
            {watchedState !== TemplateState.FINALIZED && (
              <Button variant="outlined" onClick={handleValidate}>
                Validovat
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleCloseToRescanOrFinalize}
              disabled={
                watchedState === TemplateState.FINALIZED ||
                saveTemplateMutation.isPending ||
                updateTemplateStateMutation.isPending
              }
            >
              {watchedState === TemplateState.CREATED && hasWaitingForRescan
                ? 'Uzavřít k doskenování'
                : 'Finalizovat'}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <VirtualizedSpecimenList
          items={items}
          viewOnly={false}
          replacementSourceCandidates={replacementSources}
          showOnlyRescans={showOnlyRescans}
          disabled={watchedState === TemplateState.FINALIZED}
        />
      </Box>

      <PrepareScanTemplatePreviewDialog
        opened={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        header={headerProps}
        barCode={primaryVolume?.barCode}
        items={items}
        showOnlyRescans={showOnlyRescans}
      />
    </Box>
  )
}

export default PrepareScanModalContentTemplate
