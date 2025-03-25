import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import isFunction from 'lodash/isFunction'

type TShowErrorProps = {
  error?: string
  onRetry?: () => Promise<unknown>
}

const ShowError: FC<TShowErrorProps> = ({
  error = undefined,
  onRetry = undefined,
}) => {
  const { t } = useTranslation()

  return (
    <Container
      sx={{
        marginTop: '50px',
        marginBottom: '50px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ErrorOutlinedIcon
        fontSize="large"
        sx={{ display: 'block', margin: '0 auto', marginBottom: '10px' }}
      />
      <Box component="span">
        {error || t('common.error_occurred_when_loading_data')}
      </Box>
      {isFunction(onRetry) ? (
        <Button
          sx={{
            marginTop: '30px',
          }}
          variant="contained"
          onClick={() => onRetry()}
        >
          {t('common.retry_fetch')}
        </Button>
      ) : null}
    </Container>
  )
}

export default ShowError
