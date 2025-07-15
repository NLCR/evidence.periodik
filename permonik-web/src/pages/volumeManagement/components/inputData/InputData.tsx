import { useTranslation } from 'react-i18next'
import { FC, useEffect } from 'react'
import Box from '@mui/material/Box'
import { TMe } from '../../../../schema/user'
import { TMutation } from '../../../../schema/mutation'
import { TOwner } from '../../../../schema/owner'
import { TMetaTitle } from '../../../../schema/metaTitle'
import { TEdition } from '../../../../schema/edition'
import Typography from '@mui/material/Typography'
import { blue } from '@mui/material/colors'
import CollapsableSidebar from '../../../../components/CollapsableSidebar'
import { useInputDataEditabilityContext } from './InputDataEditabilityContextProvider'
import { useParams } from 'react-router-dom'
import Loader from '../../../../components/Loader'
import InputDataForm from './InputDataForm'
import { TVolume } from '../../../../schema/volume'

export interface InputDataProps {
  me: TMe
  volume: TVolume | undefined
  isVolumeLoading: boolean
  mutations: TMutation[]
  owners: TOwner[]
  metaTitles: TMetaTitle[]
  editions: TEdition[]
}

const InputData: FC<InputDataProps> = ({ isVolumeLoading, ...props }) => {
  const { t } = useTranslation()
  const { setLocked } = useInputDataEditabilityContext()
  const { volumeId } = useParams()

  useEffect(() => {
    setLocked(!!volumeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeId])

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
            color: blue['900'],
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          {t('volume_overview.volume_information')}
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
