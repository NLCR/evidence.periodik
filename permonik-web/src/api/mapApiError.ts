import i18next from '../i18next'

export const mapApiError = (
  status: number,
  message?: string,
  code?: string
) => {
  if (status === 403) {
    return i18next.t('common.session_expired')
  }

  if (
    status === 422 &&
    message === 'VOLUME_DATE_RANGE_EXCLUDES_ACTIVE_SPECIMEN'
  ) {
    return i18next.t('volume_overview.date_range_excludes_active_specimen')
  }

  if (status === 500 && code === 'PLANNING_TIMEOUT') {
    return i18next.t('plan_digitalization_modal.timeout')
  }

  if (status >= 500 && status < 600) {
    return i18next.t('common.error_occurred_when_loading_data')
  }

  return undefined
}
