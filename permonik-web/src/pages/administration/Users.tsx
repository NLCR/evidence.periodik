import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import { clsx } from 'clsx'
import { toast } from 'react-toastify'
import { styled } from '@mui/material/styles'
import { LoadingButton } from '@mui/lab'
import Loader from '../../components/Loader'
import ShowError from '../../components/ShowError'
import { EditableUserSchema, TMe, TUser } from '../../schema/user'
import { useOwnerListQuery } from '../../api/owner'
import { useUpdateUserMutation, useUserListQuery } from '../../api/user'

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

const Users = ({ me }: { me: TMe }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [user, setUser] = useState<TUser>({
    active: false,
    email: '',
    id: '',
    firstName: '',
    lastName: '',
    owners: [],
    role: 'user',
    userName: '',
  })

  const initialUserSelected = useRef<boolean>(false)

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useUserListQuery()
  const {
    data: owners,
    isLoading: ownersLoading,
    isError: ownersError,
  } = useOwnerListQuery()

  const { mutateAsync: doUpdate, isPending: savingUser } =
    useUpdateUserMutation(me)

  useEffect(() => {
    if (users?.length && !initialUserSelected.current) {
      initialUserSelected.current = true
      setUser(users[0])
    }
  }, [users])

  const handleUpdate = async () => {
    const validation = EditableUserSchema.safeParse(user)
    if (!validation.success) {
      validation.error.errors.map((e) => toast.error(e.message))
      return
    }

    try {
      await doUpdate(user)
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
        {t('administration.users')}
      </Typography>
      {usersLoading || ownersLoading ? <Loader /> : null}
      {(!usersLoading && usersError) || (!ownersLoading && ownersError) ? (
        <ShowError />
      ) : null}
      {!usersLoading &&
      !usersError &&
      users &&
      !ownersLoading &&
      !ownersError &&
      owners ? (
        <InnerContainer>
          <ScrollArea>
            {users?.map((m) => (
              <Typography
                key={m.id}
                component="div"
                className={clsx({ active: m.id === user?.id })}
                onClick={() => (!savingUser ? setUser(m) : null)}
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
                {m.firstName} {m.lastName}
              </Typography>
            ))}
          </ScrollArea>
          <StyledDivider orientation="vertical" />
          {user && users ? (
            <FieldsContainer>
              <Typography variant="h5">
                {users.find((u) => u.id === user.id)?.firstName}{' '}
                {users.find((u) => u.id === user.id)?.lastName}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <TextField
                  size="small"
                  label={t('administration.first_name')}
                  value={user.firstName}
                  // disabled={savingUser}
                  onChange={(event) =>
                    setUser((prevState) => ({
                      ...prevState,
                      firstName: event.target.value,
                    }))
                  }
                />
                <TextField
                  size="small"
                  label={t('administration.last_name')}
                  value={user.lastName}
                  // disabled={savingUser}
                  onChange={(event) =>
                    setUser((prevState) => ({
                      ...prevState,
                      lastName: event.target.value,
                    }))
                  }
                />
                <TextField
                  size="small"
                  label={t('administration.email')}
                  value={user.email}
                  // disabled={savingUser}
                  onChange={(event) =>
                    setUser((prevState) => ({
                      ...prevState,
                      email: event.target.value,
                    }))
                  }
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                }}
              >
                <FormControl>
                  <InputLabel id="user-owner-select-label">
                    {t('administration.owners')}
                  </InputLabel>
                  <Select
                    variant="outlined"
                    labelId="user-owner-select-label"
                    multiple
                    size="small"
                    sx={{
                      minWidth: '218px',
                    }}
                    value={user.owners ? user.owners : []}
                    // disabled={savingUser}
                    onChange={(event) =>
                      setUser((prevState) => ({
                        ...prevState,
                        owners: event.target.value as string[],
                      }))
                    }
                  >
                    {owners.map((o) => (
                      <MenuItem key={o.id} value={o.id}>
                        {o.shorthand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel id="user-role-select-label">
                    {t('administration.role')}
                  </InputLabel>
                  <Select
                    variant="outlined"
                    labelId="user-role-select-label"
                    size="small"
                    value={user.role}
                    // disabled={savingUser}
                    onChange={(event) => {
                      if (event) {
                        setUser((prevState) => ({
                          ...prevState,
                          role: event.target.value as 'user' | 'admin',
                        }))
                      }
                    }}
                  >
                    <MenuItem value="user">{t('administration.user')}</MenuItem>
                    <MenuItem value="admin">
                      {t('administration.admin')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={user.active}
                    onChange={(event) =>
                      setUser((prevState) => ({
                        ...prevState,
                        active: event.target.checked,
                      }))
                    }
                  />
                }
                label={t('administration.user_active')}
              />
              <SaveButton
                variant="contained"
                onClick={() => handleUpdate()}
                loading={savingUser}
              >
                {t('administration.update')}
              </SaveButton>
            </FieldsContainer>
          ) : null}
        </InnerContainer>
      ) : null}
    </Container>
  )
}

export default Users
