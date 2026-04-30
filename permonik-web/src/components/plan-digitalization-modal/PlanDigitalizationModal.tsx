import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ModalContainer from '../ModalContainer'
import { usePlanDigitalizationQuery } from './api'
import Filters from './Filters'
import LibrariesTable from './LibrariesTable'
import { PlanDigitalizationFilters } from './schemas'
import { createEmptyMutationMark } from '@/utils/mutationMark'

type Props = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const PlanDigitalizationModal = ({ isOpen, setIsOpen }: Props) => {
  const { t } = useTranslation()
  const [submittedFilters, setSubmittedFilters] =
    useState<PlanDigitalizationFilters | null>(null)

  const form = useForm<PlanDigitalizationFilters>({
    defaultValues: {
      yearFrom: '',
      yearTo: '',
      mutationId: '',
      mutationalEdition: createEmptyMutationMark(),
    },
  })

  const {
    data = [],
    isLoading,
    isError,
  } = usePlanDigitalizationQuery(submittedFilters)

  return (
    <ModalContainer
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      closeButton={{ callback: () => setIsOpen(false) }}
      header={t('plan_digitalization_modal.title')}
      minWidth="70vw"
      maxWidth="1200px"
      maxHeight="85vh"
    >
      <Stack spacing={2}>
        <Filters form={form} onSubmit={setSubmittedFilters} />

        {isLoading ? <CircularProgress size={24} /> : null}

        {isError ? (
          <Alert severity="error">
            {t('common.error_occurred', {
              defaultValue: 'Nastala chyba při načítání dat',
            })}
          </Alert>
        ) : null}

        {!isLoading && !isError && submittedFilters ? (
          <LibrariesTable data={data} />
        ) : null}
      </Stack>
    </ModalContainer>
  )
}

export default PlanDigitalizationModal
