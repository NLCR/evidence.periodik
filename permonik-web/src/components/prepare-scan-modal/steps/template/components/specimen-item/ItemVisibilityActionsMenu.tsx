import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import ActionsMenu from '../../../../../ActionsMenu'
import { type TTemplate } from '@/components/prepare-scan-modal/schemas/schemas'
import {
  applyItemVisibility,
  hasVisibleScanTask,
} from '../../utils/templateItemLocking'

type Props = {
  itemPath: `items.${number}`
}

const ItemVisibilityActionsMenu = ({ itemPath }: Props) => {
  const { t } = useTranslation()
  const { control, getValues, setValue } = useFormContext<TTemplate>()
  const item = useWatch({ control, name: itemPath })

  const setItemVisibility = (visible: boolean) => {
    const currentItem = getValues(itemPath)

    setValue(itemPath, applyItemVisibility(currentItem, visible), {
      shouldDirty: true,
    })
  }

  const allScanTasksVisible = item
    ? item.mainScan.visible &&
      item.pageReplacements.every((replacement) => replacement.visible)
    : false
  const hasVisibleScanTasks = item ? hasVisibleScanTask(item) : false

  return (
    <ActionsMenu
      actions={[
        {
          disabled: allScanTasksVisible,
          label: t('prepare_scan_modal.content_template.show_item'),
          onClick: () => setItemVisibility(true),
        },
        {
          disabled: !hasVisibleScanTasks,
          label: t('prepare_scan_modal.content_template.hide_item'),
          onClick: () => setItemVisibility(false),
        },
      ]}
    />
  )
}

export default ItemVisibilityActionsMenu
