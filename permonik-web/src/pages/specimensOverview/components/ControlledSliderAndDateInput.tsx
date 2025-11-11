import isArray from 'lodash/isArray'
import Slider from '@mui/material/Slider'
import { FC } from 'react'
import { useSpecimensOverviewStore } from '../../../slices/useSpecimensOverviewStore'
import Loader from '../../../components/Loader'
import { styled } from '@mui/material/styles'
import theme from '../../../theme'
import Box from '@mui/material/Box'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'

const StyledSlider = styled(Slider)(() => ({
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.primary.main,
  },
}))

type TProps = {
  fetching: boolean
  pubDateMin: Dayjs
  pubDateMax: Dayjs
}

const ControlledSliderAndDateInput: FC<TProps> = ({
  fetching,
  pubDateMin,
  pubDateMax,
}) => {
  const setSliderRange = useSpecimensOverviewStore(
    (state) => state.setSliderRange
  )
  const setParams = useSpecimensOverviewStore((state) => state.setParams)
  const params = useSpecimensOverviewStore((state) => state.params)
  const sliderRange = useSpecimensOverviewStore((state) => state.sliderRange)

  return isArray(sliderRange) ? (
    <>
      <StyledSlider
        disableSwap
        step={1}
        sx={{
          width: '90%',
          margin: '40px 15px 30px 15px',
        }}
        valueLabelDisplay="on"
        marks={[
          {
            value: pubDateMin.year(),
            label: `${pubDateMin.year()}`,
          },
          {
            value: pubDateMax.year(),
            label: `${pubDateMax.year()}`,
          },
        ]}
        value={[sliderRange[0].year(), sliderRange[1].year()]}
        onChange={(event, value) => {
          if (isArray(value)) {
            setSliderRange([
              dayjs(
                new Date(
                  value[0],
                  sliderRange[0].month(),
                  sliderRange[0].date()
                )
              ),
              dayjs(
                new Date(
                  value[1],
                  sliderRange[1].month(),
                  sliderRange[1].date()
                )
              ),
            ])
          }
        }}
        onChangeCommitted={(event, value) => {
          if (isArray(value)) {
            setParams({
              ...params,
              dateStart: dayjs(
                new Date(
                  value[0],
                  sliderRange[0].month(),
                  sliderRange[0].date()
                )
              ),
              dateEnd: dayjs(
                new Date(
                  value[1],
                  sliderRange[1].month(),
                  sliderRange[1].date()
                )
              ),
            })
          }
        }}
        min={pubDateMin.year()}
        max={pubDateMax.year()}
        disabled={fetching}
      />
      <Box
        display="flex"
        justifyContent="center"
        gap={1}
        marginBottom={2}
        marginTop={-1}
      >
        <DatePicker
          value={sliderRange[0]}
          onChange={(value) => {
            setSliderRange([dayjs(value), sliderRange[1]])
            setParams({
              ...params,
              dateStart: dayjs(value),
            })
          }}
        />
        <DatePicker
          value={sliderRange[1]}
          onChange={(value) => {
            setSliderRange([sliderRange[0], dayjs(value)])
            setParams({
              ...params,
              dateEnd: dayjs(value),
            })
          }}
        />
      </Box>
    </>
  ) : (
    <Loader />
  )
}

export default ControlledSliderAndDateInput
