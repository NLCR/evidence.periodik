import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  createEmptyReplacement,
  TReplacement,
  TReplacementSource,
  TTemplate,
} from '@/components/prepare-scan-modal/schemas/schemas'
import ReplacementInput from '../../../common/ReplacementInput'

type TVisibleReplacementRow = {
  replacement: TReplacement
  replacementIndex: number
  isVisible: boolean
}

type Props = {
  itemPath: `items.${number}`
  viewOnly: boolean
  showOnlyRescans: boolean
  disabled: boolean
  replacementRows: TVisibleReplacementRow[]
  replacementFields: FieldArrayWithId<
    TTemplate,
    `${`items.${number}`}.pageReplacements`,
    'id'
  >[]
  appendReplacement: UseFieldArrayAppend<
    TTemplate,
    `${`items.${number}`}.pageReplacements`
  >
  removeReplacement: UseFieldArrayRemove
  getReplacementCandidates: (
    currentPageReplacementIndex: number | null
  ) => TReplacementSource[]
}

const AddReplacementButton = ({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void
  disabled: boolean
  label: string
}) => (
  <Button
    variant="outlined"
    startIcon={<AddIcon />}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </Button>
)

const SpecimenPageReplacementsSection = ({
  itemPath,
  viewOnly,
  showOnlyRescans,
  disabled,
  replacementRows,
  replacementFields,
  appendReplacement,
  removeReplacement,
  getReplacementCandidates,
}: Props) => {
  const { t } = useTranslation()

  const addButton = (
    <AddReplacementButton
      disabled={disabled}
      label={t('prepare_scan_modal.content_template.add_replacement_button')}
      onClick={() => appendReplacement(createEmptyReplacement())}
    />
  )

  if (replacementRows.length === 0) {
    return showOnlyRescans ? null : <Box mt={1}>{addButton}</Box>
  }

  return (
    <Box mt={1} paddingLeft={3}>
      <Stack spacing={1} alignItems="flex-start">
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            width: '100%',
            backgroundColor: theme.palette.background.default,
          })}
        >
          <Typography sx={{ mb: 1, fontWeight: 600 }}>
            {t('prepare_scan_modal.content_template.replacements_label')}
          </Typography>

          <Stack spacing={1}>
            {replacementRows.map(({ replacementIndex }) => {
              const replacementField = replacementFields[replacementIndex]

              if (!replacementField) return null

              return (
                <ReplacementInput
                  includePageSelect
                  key={replacementField.id}
                  name={`${itemPath}.pageReplacements.${replacementIndex}`}
                  index={replacementIndex}
                  viewOnly={viewOnly}
                  replacementSourceCandidates={getReplacementCandidates(
                    replacementIndex
                  )}
                  onRemove={removeReplacement}
                  disabled={disabled}
                />
              )
            })}
            {addButton}
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default SpecimenPageReplacementsSection
