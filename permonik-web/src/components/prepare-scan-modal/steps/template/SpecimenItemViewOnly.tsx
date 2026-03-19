import { TSpecimen } from '../../../../schema/specimen'

import CheckIcon from '@mui/icons-material/Check'
import WarningIcon from '@mui/icons-material/PriorityHigh'
import { Card, CardContent, Stack, Typography, Box } from '@mui/material'
import ReplacementInput from '../common/ReplacementInput'
import { getDateLabel, getNumberLabel } from './SpecimenItem'
import { noop } from 'lodash'
import theme from '../../../../theme'
import { TReplacement } from '../../schemas/schemas'

type Props = {
  specimen: TSpecimen
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
              {getNumberLabel(specimen)}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              ({getDateLabel(specimen.publicationDate)})
            </Typography>
          </Stack>
          {specimen.numExists ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckIcon color="success" fontSize="small" />
              <Typography>Skenovat ze svazku</Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningIcon color="error" fontSize="small" />
              <Typography>Nahradit</Typography>
            </Stack>
          )}
        </Stack>

        {specimen.numMissing && (
          <ReplacementInput
            allPages
            viewOnly
            value={mainReplacement}
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
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'right center',
                }}
              >
                Náhrady
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
                      Signatura
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      Vlastník
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      Čárový kód
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      Mutace
                    </th>
                    <th style={{ fontWeight: 200, textAlign: 'left' }}>
                      Strany
                    </th>
                  </thead>

                  <tbody>
                    {replacements.map((item, index) => (
                      <tr key={index}>
                        <td>{item.signature}</td>
                        <td>{item.owner}</td>
                        <td>{item.barcode}</td>
                        <td>{item.mutation}</td>
                        <td>{item.pages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Stack>
          </Box>
        )}

        {note && <Typography>Poznámka: {note}</Typography>}
      </CardContent>
    </Card>
  )
}

export default SpecimenItemViewOnly
