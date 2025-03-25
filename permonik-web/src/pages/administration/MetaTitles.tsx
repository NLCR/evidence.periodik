import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import { clsx } from 'clsx'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles'
import { LoadingButton } from '@mui/lab'
import Loader from '../../components/Loader'
import ShowError from '../../components/ShowError'
import {
  EditableMetaTitleSchema,
  TEditableMetaTitle,
} from '../../schema/metaTitle'
import {
  useCreateMetaTitleMutation,
  useMetaTitleListQuery,
  useUpdateMetaTitleMutation,
} from '../../api/metaTitle'

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

const initialState: TEditableMetaTitle = {
  name: '',
  note: '',
  isPublic: false,
}

const MetaTitles = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [metaTitle, setMetaTitle] = useState<TEditableMetaTitle>(initialState)

  const {
    data: metaTitles,
    isLoading: metaTitlesLoading,
    isError: metaTitlesError,
  } = useMetaTitleListQuery()

  const { mutateAsync: doUpdate, isPending: updatingMetaTitle } =
    useUpdateMetaTitleMutation()
  const { mutateAsync: doCreate, isPending: creatingMetaTitle } =
    useCreateMetaTitleMutation()

  const pendingMutation = updatingMetaTitle || creatingMetaTitle

  const handleSubmit = async () => {
    const validation = EditableMetaTitleSchema.safeParse(metaTitle)
    if (!validation.success) {
      validation.error.errors.map((e) => toast.error(e.message))
      return
    }
    try {
      if (metaTitle.id) {
        await doUpdate(metaTitle)
      } else {
        await doCreate(metaTitle)
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
        {t('administration.meta_titles')}
      </Typography>
      {metaTitlesLoading ? <Loader /> : null}
      {!metaTitlesLoading && metaTitlesError ? <ShowError /> : null}
      {!metaTitlesLoading && !metaTitlesError ? (
        <InnerContainer>
          <ScrollArea>
            <Typography
              component="div"
              className={clsx({ active: !metaTitle.id })}
              onClick={() =>
                !pendingMutation ? setMetaTitle(initialState) : null
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
              {t('administration.create_meta_title')}
            </Typography>
            {metaTitles?.map((m) => (
              <Typography
                key={m.id}
                component="div"
                className={clsx({ active: m.id === metaTitle?.id })}
                onClick={() => (!pendingMutation ? setMetaTitle(m) : null)}
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
                {m.name}
              </Typography>
            ))}
          </ScrollArea>
          <StyledDivider orientation="vertical" />
          {metaTitle ? (
            <FieldsContainer>
              <Typography variant="h5">
                {metaTitle.id
                  ? metaTitles?.find((o) => o.id === metaTitle.id)?.name
                  : t('administration.create_meta_title')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <TextField
                  size="small"
                  label={t('administration.title')}
                  value={metaTitle.name}
                  onChange={(event) =>
                    setMetaTitle((prevState) => ({
                      ...prevState,
                      name: event.target.value,
                    }))
                  }
                />
                <TextField
                  size="small"
                  label={t('administration.note')}
                  value={metaTitle.note}
                  onChange={(event) =>
                    setMetaTitle((prevState) => ({
                      ...prevState,
                      note: event.target.value,
                    }))
                  }
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={metaTitle.isPublic}
                    onChange={(event) =>
                      setMetaTitle((prevState) => ({
                        ...prevState,
                        isPublic: event.target.checked,
                      }))
                    }
                  />
                }
                label={t('administration.meta_title_is_public')}
              />
              <SaveButton
                variant="contained"
                onClick={() => handleSubmit()}
                disabled={!metaTitle.name.length}
                loading={pendingMutation}
              >
                {metaTitle.id
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

export default MetaTitles
