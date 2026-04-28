import { useTranslation } from 'react-i18next'
import { FC, useEffect } from 'react'
import Box from '@mui/material/Box'
undefined
undefined
undefined
undefined
undefined
import Typography from '@mui/material/Typography'
undefined
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useParams } from 'react-router-dom'
undefined
import InputDataForm from './InputDataForm'
undefined
undefined

export interface InputDataProps {
  me: TMe
  volume: TVolume | undefined
  isVolumeLoading: boolean
  mutations: TMutation[]
  owners: TOwner[]
  metaTitles: TMetaTitle[]
  editions: TEdition[]
  duplicated?: boolean
}

const InputData: FC<InputDataProps> = ({ isVolumeLoading, ...props }) => {
  const { t } = useTranslation()
  const { setLocked } = useInputDataEditabilityContext()
  const { volumeId } = useParams()

  useEffect(() => {
    setLocked(!!volumeId || !!props.duplicated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeId, props.duplicated])

  return (
    <CollapsableSidebar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // boxShadow: theme.shadows[1],
          flexShrink: 0,
          height: '100%',
        }}
      >
        <Typography
          sx={{
            marginBottom: '8px',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          {t('volume_overview.volume_information_edit')}
        </Typography>

        <Box
          sx={{
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
          }}
        >
          {isVolumeLoading ? <Loader /> : <InputDataForm {...props} />}
        </Box>
      </Box>
    </CollapsableSidebar>
  )
}

export default InputData
