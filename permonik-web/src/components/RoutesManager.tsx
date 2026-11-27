import { useTranslation } from 'react-i18next'
import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'
import NotFound from '../pages/NotFound'
import Home from '../pages/Home'
import Loader from './Loader'
import SpecimensOverview from '../pages/specimensOverview/SpecimensOverview'
import { useMeQuery } from '@/api/user'
import { APP_WITH_EDITING_ENABLED } from '@/utils/constants'
import Administration from '../pages/administration/Administration'
import VolumeManagement from '../pages/volumeManagement/VolumeManagement'
import VolumeOverview from '../pages/volumeOverview/VolumeOverview'
import Users from '../pages/administration/Users'
import Owners from '../pages/administration/Owners'
import MetaTitles from '../pages/administration/MetaTitles'
import Editions from '../pages/administration/Editions'
import Mutations from '../pages/administration/Mutations'
import Layout from './Layout'
import ShowError from './ShowError'
import { hasPermission } from '@/schema/user'

// TODO: fix react-router suspense loading
// const Administration = React.lazy(
//   () => import('../pages/administration/Administration')
// )
// const Users = React.lazy(() => import('../pages/administration/Users'))
// const Owners = React.lazy(() => import('../pages/administration/Owners'))
// const MetaTitles = React.lazy(
//   () => import('../pages/administration/MetaTitles')
// )
// const Editions = React.lazy(() => import('../pages/administration/Editions'))
// const Mutations = React.lazy(() => import('../pages/administration/Mutations'))
//
// const VolumeOverview = React.lazy(
//   () => import('../pages/volumeOverview/VolumeOverview')
// )
// const VolumeManagement = React.lazy(
//   () => import('../pages/volumeManagement/VolumeManagement')
// )

const RoutesManager = () => {
  const { t } = useTranslation()
  const { data: me, isLoading, isError, refetch } = useMeQuery()

  const canWriteVolumes =
    APP_WITH_EDITING_ENABLED && hasPermission(me, 'VOLUME_WRITE')
  const canOpenExistingVolume =
    APP_WITH_EDITING_ENABLED &&
    (canWriteVolumes || hasPermission(me, 'TEMPLATE_MANAGE'))
  const canReadUsers =
    APP_WITH_EDITING_ENABLED && hasPermission(me, 'USER_READ')
  const canWriteReferences =
    APP_WITH_EDITING_ENABLED && hasPermission(me, 'REFERENCE_WRITE')
  const canUseAdministration = canReadUsers || canWriteReferences

  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return (
      <ShowError
        error={t('common.error_occurred_somewhere')}
        onRetry={refetch}
      />
    )
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/:lang" element={<Home />} />
        <Route
          path={`/:lang/${t('urls.specimens_overview')}/:metaTitleId`}
          element={<SpecimensOverview />}
        />
        {canWriteVolumes ? (
          <>
            <Route
              path={`/:lang/${t('urls.volume_overview')}`}
              element={<VolumeManagement />}
            />
            <Route
              path={`/:lang/${t('urls.volume_overview')}/duplicated`}
              element={<VolumeManagement duplicated={true} />}
            />
          </>
        ) : null}
        {canOpenExistingVolume ? (
          <Route
            path={`/:lang/${t('urls.volume_overview')}/:volumeId`}
            element={<VolumeManagement />}
          />
        ) : (
          <Route
            path={`/:lang/${t('urls.volume_overview')}/:volumeId`}
            element={<VolumeOverview />}
          />
        )}
        {canUseAdministration && me ? (
          <Route
            path={`/:lang/${t('urls.administration')}`}
            element={<Administration me={me} />}
          >
            <Route
              index
              element={
                <Navigate
                  to={canReadUsers ? t('urls.users') : t('urls.owners')}
                />
              }
            />
            {canReadUsers ? (
              <Route path={t('urls.users')} element={<Users me={me} />} />
            ) : null}
            {canWriteReferences ? (
              <>
                <Route path={t('urls.owners')} element={<Owners />} />
                <Route path={t('urls.meta_titles')} element={<MetaTitles />} />
                <Route path={t('urls.editions')} element={<Editions />} />
                <Route path={t('urls.mutations')} element={<Mutations />} />
              </>
            ) : null}
          </Route>
        ) : null}
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}

export default RoutesManager
