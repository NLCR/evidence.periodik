import { BACK_META_TITLE_ID, JUMP_TO_SPECIMEN_WITH_ID } from './constants'

export const generateVolumeUrlWithParams = (
  url: string,
  metaTitleId: string,
  specimenId?: string
) => {
  let volumeUrl = `${url}?${BACK_META_TITLE_ID}=${metaTitleId}`

  if (specimenId) {
    volumeUrl += `&${JUMP_TO_SPECIMEN_WITH_ID}=${specimenId}`
  }

  return volumeUrl
}
