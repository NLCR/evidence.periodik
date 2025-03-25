import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { clsx } from 'clsx'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles'
import { LoadingButton } from '@mui/lab'
import Loader from '../../components/Loader'
import ShowError from '../../components/ShowError'
import {
  EditableMutationSchema,
  TEditableMutation,
} from '../../schema/mutation'
import {
  useCreateMutationMutation,
  useMutationListQuery,
  useUpdateMutationMutation,
} from '../../api/mutation'

import { useLanguageCode } from '../../hooks/useLanguageCode'

const Container = styled('div')(() => ({
  position: 'relative',
}))

const ScrollArea = styled('div')(({ theme }) => ({
  width: '30%',
  minWidth: theme.typography.pxToRem(200),
  maxWidth: theme.typography.pxToRem(300),
  paddingLeft: theme.spacing(1.25),
  paddingRight: theme.spacing(0.5),
  height: '55vh',
  overflowY: 'auto',
}))

const InnerContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1.25),
  justifyItems: 'stretch',
  gap: theme.spacing(2.5),
}))

const FieldsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '55vh',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
}))

const StyledDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.grey[300],
}))

const SaveButton = styled(LoadingButton)(() => ({
  width: 'fit-content',
}))

const initialState: TEditableMutation = {
  name: {
    cs: '',
    sk: '',
    en: '',
  },
}

const Mutations = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [mutation, setMutation] = useState<TEditableMutation>(initialState)
  const { languageCode } = useLanguageCode()

  const {
    data: mutations,
    isLoading: mutationsLoading,
    isError: mutationsError,
  } = useMutationListQuery()

  const { mutateAsync: doUpdate, isPending: updatingMutation } =
    useUpdateMutationMutation()
  const { mutateAsync: doCreate, isPending: creatingMutation } =
    useCreateMutationMutation()

  const pendingMutation = updatingMutation || creatingMutation

  const handleSubmit = async () => {
    const validation = EditableMutationSchema.safeParse(mutation)
    if (!validation.success) {
      validation.error.errors.map((e) => toast.error(e.message))
      return
    }
    try {
      if (mutation.id) {
        await doUpdate(mutation)
      } else {
        await doCreate(mutation)
      }
      toast.success(t('common.saved_successfully'))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // toast.error(t('common.error_occurred_somewhere'))
    }
  }

  return (
    <Container>
      <Typography
        variant="h5"
        sx={{ color: theme.palette.primary.main, fontWeight: '600' }}
      >
        {t('administration.mutations')}
      </Typography>
      {mutationsLoading ? <Loader /> : null}
      {!mutationsLoading && mutationsError ? <ShowError /> : null}
      {!mutationsLoading && !mutationsError ? (
        <InnerContainer>
          <ScrollArea>
            <Typography
              component="div"
              className={clsx({ active: !mutation.id })}
              onClick={() =>
                !pendingMutation ? setMutation(initialState) : null
              }
              sx={{
                marginTop: theme.spacing(0.875),
                marginBottom: theme.spacing(0.875),
                borderRadius: theme.shape.borderRadius,
                padding: `${theme.spacing(0.625)} ${theme.spacing(1.25)}`,
                cursor: 'pointer',
                '&:hover': {
                  color: theme.palette.grey['50'],
                  backgroundColor: theme.palette.grey['900'],
                },
                '&.active': {
                  color: theme.palette.grey['50'],
                  backgroundColor: theme.palette.grey['900'],
                },
              }}
            >
              {t('administration.create_mutation')}
            </Typography>
            {mutations?.map((m) => (
              <Typography
                key={m.id}
                component="div"
                className={clsx({ active: m.id === mutation?.id })}
                onClick={() => (!pendingMutation ? setMutation(m) : null)}
                sx={{
                  marginTop: theme.spacing(0.875),
                  marginBottom: theme.spacing(0.875),
                  borderRadius: theme.shape.borderRadius,
                  padding: `${theme.spacing(0.625)} ${theme.spacing(1.25)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    color: theme.palette.grey['50'],
                    backgroundColor: theme.palette.grey['900'],
                  },
                  '&.active': {
                    color: theme.palette.grey['50'],
                    backgroundColor: theme.palette.grey['900'],
                  },
                }}
              >
                {m.name[languageCode]}
              </Typography>
            ))}
          </ScrollArea>
          <StyledDivider orientation="vertical" />
          {mutation ? (
            <FieldsContainer>
              <Typography variant="h5">
                {mutation.id
                  ? mutations?.find((o) => o.id === mutation.id)?.name[
                      languageCode
                    ]
                  : t('administration.create_mutation')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <TextField
                  size="small"
                  label={t('administration.cs_name')}
                  value={mutation.name.cs}
                  // disabled={savingUser}
                  onChange={(event) =>
                    setMutation((prevState) => ({
                      ...prevState,
                      name: { ...prevState.name, cs: event.target.value },
                    }))
                  }
                />
                <TextField
                  size="small"
                  label={t('administration.sk_name')}
                  value={mutation.name.sk}
                  // disabled={savingUser}
                  onChange={(event) =>
                    setMutation((prevState) => ({
                      ...prevState,
                      name: { ...prevState.name, sk: event.target.value },
                    }))
                  }
                />
                <TextField
                  size="small"
                  label={t('administration.en_name')}
                  value={mutation.name.en}
                  // disabled={savingUser}
                  onChange={(event) =>
                    setMutation((prevState) => ({
                      ...prevState,
                      name: { ...prevState.name, en: event.target.value },
                    }))
                  }
                />
              </Box>
              <SaveButton
                variant="contained"
                onClick={() => handleSubmit()}
                disabled={!Object.values(mutation.name).every((e) => e.length)}
                loading={pendingMutation}
              >
                {mutation.id
                  ? t('administration.update')
                  : t('administration.create')}
              </SaveButton>
            </FieldsContainer>
          ) : null}
        </InnerContainer>
      ) : null}
    </Container>
  )
}

export default Mutations
