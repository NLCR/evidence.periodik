import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { type FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type TTemplateItem } from '../../../schemas/schemas'
import { buildGroupedScanSections } from '../templateGrouping'
import GroupedSectionCard from './GroupedSectionCard'

type Props = {
  items: TTemplateItem[]
  showOnlyRescans: boolean
  showOnlyUnlocked?: boolean
  compact?: boolean
}

const GroupedTemplateSections: FC<Props> = ({
  items,
  showOnlyRescans,
  showOnlyUnlocked = false,
  compact = false,
}) => {
  const { t } = useTranslation()

  const sections = useMemo(
    () => buildGroupedScanSections(items, showOnlyRescans, showOnlyUnlocked),
    [items, showOnlyRescans, showOnlyUnlocked]
  )

  if (sections.length === 0) {
    return (
      <Typography>
        {t('prepare_scan_modal.content_template.no_items')}
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {sections.map((section) => (
        <GroupedSectionCard
          key={section.key}
          compact={compact}
          section={section}
        />
      ))}
    </Box>
  )
}

export default GroupedTemplateSections
