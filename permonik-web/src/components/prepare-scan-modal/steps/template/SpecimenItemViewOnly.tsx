import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import { Card, CardContent, Stack, Typography, Box } from '@mui/material'
import { getDateLabel, getNumberLabel } from './SpecimenItem'
import { noop } from 'lodash'
import theme from '../../../../theme'
import { TReplacement, TTemplateSpecimenRef } from '../../schemas/schemas'
import ReplacementSourceInput from '../common/ReplacementSourceInput'
import { useTranslation } from 'react-i18next'

type Props = {
  specimen: TTemplateSpecimenRef
  replacements: TReplacement[]
  mainReplacement: TReplacement | null
  note: string
}

const SpecimenItemViewOnly = ({
  specimen,
  replacements,
  mainReplacement,
  note,
}: Props) => {
  const { t } = useTranslation()
  const getPagesLabel = (value: string | null | undefined) => {
    if (!value) return t('prepare_scan_modal.content_template.all_pages_label')

    const normalizedValue = value.trim().toLowerCase()
    if (['všechny', 'vsetky', 'všetky', 'all'].includes(normalizedValue)) {
      return t('prepare_scan_modal.content_template.all_pages_label')
    }

    return value
  }

  return (
    <Card
      variant="outlined"
      sx={{
        paddingX: 1,
        borderRadius: 0,
        borderLeftColor: specimen.numExists ? 'green' : 'red',
        borderLeftWidth: 3,
      }}
    >
      <CardContent
        sx={{ paddingX: 1, paddingY: 0.5, ':last-child': { pb: 0.5 } }}
      >
        <Stack justifyContent={'space-between'} direction={'row'}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {getNumberLabel(specimen, t)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              (
              {specimen.publicationDate
                ? getDateLabel(specimen.publicationDate)
                : '-'}
              )
            </Typography>
          </Stack>
          {specimen.numExists ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckIcon color="success" fontSize="small" />
              <Typography>
                {t('prepare_scan_modal.content_template.scan_from_volume')}
              </Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningIcon color="error" fontSize="small" />
              <Typography>
                {t('prepare_scan_modal.content_template.replace_label')}
              </Typography>
            </Stack>
          )}
        </Stack>

        {specimen.numMissing && (
          <ReplacementSourceInput
            viewOnly
            value={mainReplacement?.volume ?? {}}
            onChange={noop}
          />
        )}

        {replacements.length > 0 && (
          <Box mt={1} paddingLeft={0} marginLeft={-4}>
            <Stack spacing={1} alignItems="flex-start" direction={'row'}>
              <Typography
                sx={{
                  mb: 0,
                  fontWeight: 600,
                  transform: 'translateY(-10px) rotate(-90deg)',
                  transformOrigin: 'right center',
                }}
              >
                {t('prepare_scan_modal.content_template.replacements_label')}
              </Typography>
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: '0.25rem 1rem',
                  width: '100%',
                  backgroundColor: '#fafafa',
                }}
              >
                <table style={{ width: '100%' }}>
                  <thead
                    style={{
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      fontWeight: 200,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      {t('prepare_scan_modal.content_template.signature_label')}
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      {t('prepare_scan_modal.content_template.volume_owner')}
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      {t(
                        'prepare_scan_modal.content_template.replacement_barcode'
                      )}
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      {t('prepare_scan_modal.content_template.volume_mutation')}
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      {t('prepare_scan_modal.content_template.pages_label')}
                    </th>
                  </thead>

                  <tbody>
                    {replacements.map((item, index) => (
                      <tr key={index}>
                        <td>{item.volume.signature}</td>
                        <td>{item.volume.owner}</td>
                        <td>{item.volume.barcode}</td>
                        <td>{item.volume.mutation}</td>
                        <td>{getPagesLabel(item.pages)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Stack>
          </Box>
        )}

        {note && (
          <Typography>
            {t('prepare_scan_modal.content_template.note_label')} {note}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default SpecimenItemViewOnly
