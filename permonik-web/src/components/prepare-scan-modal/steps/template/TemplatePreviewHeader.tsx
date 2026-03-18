import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { FC } from 'react'

export type TTemplatePreviewHeaderProps = {
  title: string
  signature?: string
  subTitle?: string
  owner?: string
  mutation?: string
  mutationEdition?: string
  dateFrom?: string
  dateTo?: string
  specimensCount: number
  attachmentsCount: number
  displayCurrentState?: boolean
  currentStateLabel?: string
}

const TemplatePreviewHeader: FC<TTemplatePreviewHeaderProps> = ({
  title,
  signature = undefined,
  subTitle = undefined,
  owner = undefined,
  mutation = undefined,
  mutationEdition = undefined,
  dateFrom = undefined,
  dateTo = undefined,
  specimensCount,
  attachmentsCount,
  displayCurrentState = false,
  currentStateLabel = undefined,
}) => {
  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
          {title} (signatura {signature ?? 'neznámá signatura'})
        </Typography>
        {displayCurrentState && (
          <Chip
            icon={<CheckCircleRoundedIcon fontSize="small" />}
            label={currentStateLabel ?? 'Aktuální stav'}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              px: 0.5,
              bgcolor: 'primary.50',
              borderColor: 'primary.200',
            }}
          />
        )}
      </Stack>
      <Box display="grid" gridTemplateColumns="1fr 1fr">
        <Typography>Podnázev: {subTitle ?? '-'}</Typography>
        <Typography>Vlastník: {owner ?? '-'}</Typography>
        <Typography>Mutace: {mutation ?? '-'}</Typography>
        <Typography>Mutační vydání: {mutationEdition ?? '-'}</Typography>
        <Typography>Rozsah od: {dateFrom ?? '-'}</Typography>
        <Typography>Rozsah do: {dateTo ?? '-'}</Typography>
        <Typography>Počet čísel: {specimensCount}</Typography>
        <Typography>Počet příloh: {attachmentsCount}</Typography>
      </Box>
    </>
  )
}

export default TemplatePreviewHeader
