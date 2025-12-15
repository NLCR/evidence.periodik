import type { TSpecimenDamageTypes } from '../schema/specimen'
const { VITE_APP_TYPE } = import.meta.env

export const APP_WITH_EDITING_ENABLED = VITE_APP_TYPE === 'admin'

export const damageTypes: TSpecimenDamageTypes[] = [
  'OK',
  'ChCC',
  'ChS',
  'PP',
  'Deg',
  'ChPag',
  'ChCis',
  'ChSv',
  'Cz',
  'NS',
  'CzV',
  'ChDatum',
]

export const BACK_META_TITLE_ID = 'backMetaTitleId'
export const JUMP_TO_SPECIMEN_WITH_ID = 'jumpToSpecimenWithId'
export const VOLUME_DUPLICATE_SOURCE_ID = 'volumeDuplicateSourceId'

export const LOGIN_URL = '/login/shibboleth'
