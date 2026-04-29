import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useFormContext } from 'react-hook-form'
import IconCheckbox from '@/components/form/IconCheckbox'
import ReplacementSourceInput from '@/components/prepare-scan-modal/steps/common/ReplacementSourceInput'
import type {
  TTemplate,
  TReplacement,
  TTemplateSpecimenRef,
} from '@/components/prepare-scan-modal/schemas/schemas'
import {
  getDateLabel,
  getNumberLabel,
} from '@/components/prepare-scan-modal/steps/template/utils/specimenLabels'
import theme from '@/theme'
import { applyItemVisibility } from '../../utils/templateItemLocking'

type TSpecimenReplacementViewOnlyRow = {
  replacement: TReplacement
  replacementIndex: number
}

type Props = {
  specimen: TTemplateSpecimenRef
  replacementRows: TSpecimenReplacementViewOnlyRow[]
  mainReplacement: TReplacement | null
  itemPath?: `items.${number}`
  note: string
}

const SpecimenItemViewOnly = ({
  specimen,
  replacementRows,
  mainReplacement,
  itemPath = undefined,
  note,
}: Props) => {
  const { t } = useTranslation()
  const { getValues, setValue } = useFormContext<TTemplate>()

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              {specimen.numExists ? (
                <CheckIcon color="success" fontSize="small" />
              ) : (
                <WarningIcon color="error" fontSize="small" />
              )}
              <Typography>
                {specimen.numExists
                  ? t('prepare_scan_modal.content_template.scan_from_volume')
                  : t('prepare_scan_modal.content_template.replace_label')}
              </Typography>
            </Stack>
            {itemPath ? (
              <IconCheckbox
                name={itemPath}
                iconFalse={<VisibilityOffIcon />}
                iconTrue={<VisibilityIcon />}
                afterChange={(value) => {
                  const currentItem = getValues(itemPath)
                  setValue(itemPath, applyItemVisibility(currentItem, value), {
                    shouldDirty: true,
                  })
                }}
              />
            ) : null}
          </Stack>
        </Stack>

        {specimen.numMissing && (
          <ReplacementSourceInput
            viewOnly
            value={mainReplacement?.volume ?? {}}
            onChange={noop}
          />
        )}

        {replacementRows.length > 0 && (
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
                      color: theme.palette.primary.main,
                      textAlign: 'left',
                    }}
                  >
                    <tr>
                      <th style={{ textAlign: 'left', fontWeight: 100 }}>
                        {t('common.fields.signature')}
                      </th>
                      <th style={{ textAlign: 'left', fontWeight: 100 }}>
                        {t('common.fields.owner')}
                      </th>
                      <th style={{ textAlign: 'left', fontWeight: 100 }}>
                        {t(
                          'prepare_scan_modal.content_template.replacement_barcode'
                        )}
                      </th>
                      <th style={{ textAlign: 'left', fontWeight: 100 }}>
                        {t('common.fields.mutation')}
                      </th>
                      <th style={{ textAlign: 'left', fontWeight: 100 }}>
                        {t('prepare_scan_modal.content_template.pages_label')}
                      </th>
                      {itemPath ? <th></th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {replacementRows.map(
                      ({ replacement, replacementIndex }) => (
                        <tr key={replacementIndex}>
                          <td>{replacement.volume.signature || '-'}</td>
                          <td>{replacement.volume.owner || '-'}</td>
                          <td>{replacement.volume.barcode || '-'}</td>
                          <td>{replacement.volume.mutation || '-'}</td>
                          <td>{replacement.pages || '-'}</td>
                          {itemPath ? (
                            <td>
                              <IconCheckbox
                                name={`${itemPath}.pageReplacements.${replacementIndex}.visible`}
                                size="small"
                                iconTrue={<VisibilityIcon />}
                                iconFalse={<VisibilityOffIcon />}
                              />
                            </td>
                          ) : null}
                        </tr>
                      )
                    )}
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
