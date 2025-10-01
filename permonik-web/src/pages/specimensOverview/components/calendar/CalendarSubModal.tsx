import { t } from 'i18next'
import React, { Dispatch, SetStateAction } from 'react'
import ModalContainer from '../../../../components/ModalContainer'
import VolumeStatsModalContent from '../../../../components/VolumeStatsModalContent'
import { generateVolumeUrlWithParams } from '../../../../utils/generateVolumeUrlWithParams'
import { useNavigate, useParams } from 'react-router-dom'
import { TSpecimen } from '../../../../schema/specimen'
import { useTranslation } from 'react-i18next'

type Props = {
  subModalData: TSpecimen | null
  setSubModalData: Dispatch<SetStateAction<TSpecimen | null>>
}

const CalendarSubModal = ({ setSubModalData, subModalData }: Props) => {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const { metaTitleId } = useParams()

  return (
    <ModalContainer
      autoWidth
      minWidth="30rem"
      onClose={() => {
        setSubModalData(null)
      }}
      closeButton={{
        callback: () => {
          setSubModalData(null)
        },
      }}
      acceptButton={{
        callback: () => {
          if (subModalData?.volumeId) {
            navigate(
              generateVolumeUrlWithParams(
                `/${i18n.resolvedLanguage}/${t('urls.volume_overview')}/${
                  subModalData.volumeId
                }`,
                metaTitleId || '',
                subModalData.id
              )
            )
          }
        },
        text: t('specimens_overview.detailed_volume_overview'),
      }}
      opened={!!subModalData}
      header={`${t('specimens_overview.volume_overview_modal_link')} ${subModalData?.barCode}`}
    >
      <VolumeStatsModalContent volumeId={subModalData?.volumeId} />
    </ModalContainer>
  )
}

export default CalendarSubModal
