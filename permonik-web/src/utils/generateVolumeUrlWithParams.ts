import {
  BACK_META_TITLE_ID,
  JUMP_TO_SPECIMEN_WITH_ID,
  VOLUME_DUPLICATE_SOURCE_ID,
} from './constants'
import { FieldsToReset } from './duplicateVolume/types'

export const generateVolumeUrlWithParams = (
  url: string,
  metaTitleId: string,
  specimenId?: string,
  volumeDuplicateSourceId?: string,
  fieldsToReset?: FieldsToReset[]
) => {
  let volumeUrl = `${url}?${BACK_META_TITLE_ID}=${metaTitleId}`

  if (specimenId) {
    volumeUrl += `&${JUMP_TO_SPECIMEN_WITH_ID}=${specimenId}`
  }

  if (volumeDuplicateSourceId) {
    volumeUrl += `&${VOLUME_DUPLICATE_SOURCE_ID}=${volumeDuplicateSourceId}`
  }

  if (fieldsToReset && fieldsToReset.length > 0) {
    volumeUrl += `&fieldsToReset=${encodeURIComponent(JSON.stringify(fieldsToReset))}`
  }

  return volumeUrl
}
