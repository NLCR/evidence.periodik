import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import GroupedSectionItemsTable from './GroupedSectionItemsTable'
import { getSectionMetadata, getSectionTitle } from './groupedSectionViewModel'
import { TGroupedScanSection } from '../templateGrouping'

type Props = {
  compact: boolean
  section: TGroupedScanSection
}

const GroupedSectionCard: FC<Props> = ({ compact, section }) => {
  const { t } = useTranslation()
  const title = getSectionTitle(section, t)
  const metadata = getSectionMetadata(section, t)

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 0,
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor:
          section.sectionType === 'primaryVolume'
            ? theme.palette.success.main
            : theme.palette.error.main,
      })}
    >
      <CardContent
        sx={{
          px: compact ? 1 : 1.5,
          py: compact ? 0.75 : 1,
          '&:last-child': {
            pb: compact ? 0.75 : 1,
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        {section.sectionType !== 'primaryVolume' && metadata.length > 0 ? (
          <Box mt={0.75}>
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
              {metadata.map(({ label, value }) => (
                <Typography
                  key={label}
                  variant="body2"
                  sx={{ wordBreak: 'break-word' }}
                >
                  <Box
                    component="span"
                    sx={{ color: 'text.secondary', mr: 0.5 }}
                  >
                    {`${label}:`}
                  </Box>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {value}
                  </Box>
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : null}

        <GroupedSectionItemsTable compact={compact} section={section} />
      </CardContent>
    </Card>
  )
}

export default GroupedSectionCard
