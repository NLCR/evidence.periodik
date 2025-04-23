import isArray from 'lodash/isArray'
import Slider from '@mui/material/Slider'
import { FC } from 'react'
import { useSpecimensOverviewStore } from '../../../slices/useSpecimensOverviewStore'
import Loader from '../../../components/Loader'
import { styled } from '@mui/material/styles'
import { blue } from '@mui/material/colors'

const StyledSlider = styled(Slider)(() => ({
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: blue['900'],
  },
}))

type TProps = {
  fetching: boolean
  pubDaysMin: number
  pubDaysMax: number
}

const ControlledSlider: FC<TProps> = ({ fetching, pubDaysMin, pubDaysMax }) => {
  const setSliderRange = useSpecimensOverviewStore(
    (state) => state.setSliderRange
  )
  const setParams = useSpecimensOverviewStore((state) => state.setParams)
  const params = useSpecimensOverviewStore((state) => state.params)
  const sliderRange = useSpecimensOverviewStore((state) => state.sliderRange)

  return isArray(sliderRange) ? (
    <StyledSlider
      disableSwap
      step={1}
      sx={{
        width: '95%',
        margin: '40px auto 30px auto',
      }}
      valueLabelDisplay="on"
      marks={[
        {
          value: pubDaysMin,
          label: `${pubDaysMin}`,
        },
        {
          value: pubDaysMax,
          label: `${pubDaysMax}`,
        },
      ]}
      value={[sliderRange[0], sliderRange[1]]}
      onChange={(event, value) => {
        if (isArray(value)) {
          setSliderRange([value[0], value[1]])
        }
      }}
      onChangeCommitted={(event, value) => {
        if (isArray(value)) {
          setParams({
            ...params,
            dateStart: value[0],
            dateEnd: value[1],
          })
        }
      }}
      min={pubDaysMin}
      max={pubDaysMax}
      disabled={fetching}
    />
  ) : (
    <Loader />
  )
}

export default ControlledSlider
