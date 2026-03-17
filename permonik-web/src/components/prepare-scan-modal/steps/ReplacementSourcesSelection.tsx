import { Dispatch, SetStateAction } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import Loader from '../../Loader'
import ShowError from '../../ShowError'
import ReplacementInput from '../ReplacementInput'
import { emptyReplacement, TScanTemplateSettings } from '../schemas'
import { useReplacementSourceCandidatesQuery } from '../../../api/replacementSourceCandidates'
import {
  createSelectOptionsFromReplacementSourceCandidates,
  filterReplacementSourceCandidates,
  removeReplacementSourceAtIndex,
} from './utils/prepareScanModalContentVolumes'

type Props = {
  templateSettings: TScanTemplateSettings
  setTemplateSettings: Dispatch<SetStateAction<TScanTemplateSettings>>
}

const ReplacementSourcesSelection = ({
  templateSettings,
  setTemplateSettings,
}: Props) => {
  const replacementSourceCandidatesRequest = {
    issues: templateSettings.issues,
    replacementSourcesParameters: templateSettings.replacementSourcesParameters,
  }

  const {
    data: replacementSourceCandidates,
    isLoading: replacementSourceCandidatesLoading,
    isError: replacementSourceCandidatesError,
  } = useReplacementSourceCandidatesQuery(replacementSourceCandidatesRequest)

  const safeReplacementSourceCandidates = replacementSourceCandidates ?? []
  const replacementSelectOptionsByIndex =
    templateSettings.replacementSources.map((currentReplacementSource) =>
      createSelectOptionsFromReplacementSourceCandidates(
        filterReplacementSourceCandidates({
          candidates: safeReplacementSourceCandidates,
          replacementSources: templateSettings.replacementSources,
          currentReplacementSource,
        })
      )
    )
  if (replacementSourceCandidatesLoading) return <Loader size="small" />
  if (replacementSourceCandidatesError) return <ShowError />

  return (
    <>
      {templateSettings.replacementSources.map((item, index) => (
        <Box key={index} display={'flex'} gap={1} alignItems={'center'}>
          {index + 1}:{' '}
          <ReplacementInput
            allPages
            valueType="source"
            value={item}
            selectOptions={replacementSelectOptionsByIndex[index] ?? []}
            onChange={(value) =>
              setTemplateSettings((prev) => ({
                ...prev,
                replacementSources: prev.replacementSources.map((x, i) =>
                  i === index ? value : x
                ),
              }))
            }
          />
          <IconButton
            aria-label="Smazat zdroj náhrady"
            disabled={index === 0}
            onClick={() =>
              setTemplateSettings((prev) => ({
                ...prev,
                replacementSources: removeReplacementSourceAtIndex(
                  prev.replacementSources,
                  index
                ),
              }))
            }
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        variant="outlined"
        onClick={() =>
          setTemplateSettings((prev) => ({
            ...prev,
            replacementSources: [...prev.replacementSources, emptyReplacement],
          }))
        }
      >
        Přidat zdroj náhrad
      </Button>
    </>
  )
}

export default ReplacementSourcesSelection
