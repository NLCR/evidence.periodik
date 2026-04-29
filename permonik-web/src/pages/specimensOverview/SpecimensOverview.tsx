import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { Suspense, useState } from 'react'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { useMetaTitleQuery } from '../../api/metaTitle'
import Loader from '../../components/Loader'
import ShowError from '../../components/ShowError'
import ShowInfoMessage from '../../components/ShowInfoMessage'
import { useSpecimensOverviewStore } from '../../slices/useSpecimensOverviewStore'
import SpecimenDayDetailExampleImage from '../../assets/images/specimen-day-detail-example.png'
import Facets from './components/facets/Facets'
import Calendar from './components/calendar/Calendar'
import CalendarToolbar from './components/calendar/CalendarToolbar'
import ModalContainer from '../../components/ModalContainer'
import SynchronizeYearsSwitch from './components/SynchronizeYearsSwitch'
import CollapsableSidebar from '../../components/CollapsableSidebar'
import FacetsContextProvider from './components/facets/FacetsContextProvider'
import useMediaQuery from '@mui/material/useMediaQuery'
import theme from '../../theme'

const Table = React.lazy(() => import('./components/Table'))

const SpecimensOverview = () => {
  const { metaTitleId } = useParams()
  const [modalOpened, setModalOpened] = useState(false)
  const { t } = useTranslation()
  const view = useSpecimensOverviewStore((state) => state.view)
  const setView = useSpecimensOverviewStore((state) => state.setView)

  const {
    data: metaTitle,
    isLoading: metaTitleLoading,
    isError: metaTitleError,
  } = useMetaTitleQuery(metaTitleId)

  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'))

  if (metaTitleLoading) {
    return <Loader />
  }

  if (metaTitleError) {
    return <ShowError />
  }

  if (!metaTitle) {
    return (
      <ShowInfoMessage message={t('specimens_overview.meta_title_not_found')} />
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '16px',
        position: 'relative',
        width: '100%',
      }}
    >
      <ModalContainer
        onClose={() => setModalOpened(false)}
        closeButton={{ callback: () => setModalOpened(false) }}
        opened={modalOpened}
        header={t('specimens_overview.help')}
        style="fitted"
      >
        <Typography
          sx={{
            marginBottom: '5px',
            fontWeight: '600',
          }}
        >
          {t('specimens_overview.help_desc_1')}
        </Typography>
        <Typography
          sx={{
            marginBottom: '5px',
          }}
        >
          {t('specimens_overview.help_desc_2')}
        </Typography>
        <img
          alt="Help"
          src={SpecimenDayDetailExampleImage}
          width={200}
          style={{ marginBottom: '20px' }}
        />
      </ModalContainer>
      <CollapsableSidebar>
        <Box
          sx={{
            textAlign: 'left',
            padding: '8px',
            boxShadow: '8px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            height: '100%',
          }}
        >
          <FacetsContextProvider metaTitle={metaTitle}>
            <Facets metaTitle={metaTitle} />
          </FacetsContextProvider>
        </Box>
      </CollapsableSidebar>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '8px',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            marginTop: '10px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Tabs
              value={view}
              onChange={(event, newValue) => setView(newValue)}
              sx={{
                width: 'fit-content',
              }}
            >
              <Tab
                label={isMobile ? null : t('specimens_overview.calendar')}
                value="CALENDAR"
                icon={<CalendarMonthIcon />}
                iconPosition="start"
              />
              <Tab
                label={isMobile ? null : t('specimens_overview.table')}
                // disabled
                value="TABLE"
                icon={<TableRowsIcon />}
                iconPosition="start"
              />
            </Tabs>
            <Box
              sx={{
                display: 'flex',
                marginLeft: '20px',
                marginRight: '20px',
                fontSize: '14px',
                color: theme.palette.primary.main,
                fontWeight: 'bolder',
                alignItems: 'center',
              }}
            >
              {view === 'CALENDAR' ? (
                <CalendarToolbar metaTitle={metaTitle} />
              ) : null}
            </Box>
            <SynchronizeYearsSwitch />
          </Box>
          {view === 'CALENDAR' && (
            <IconButton onClick={() => setModalOpened(true)}>
              <HelpOutlineIcon />
            </IconButton>
          )}
        </Box>
        {view === 'CALENDAR' ? (
          <Calendar
            metaTitle={metaTitle}
            switchToTable={() => setView('TABLE')}
          />
        ) : (
          <Suspense>
            <Table metaTitle={metaTitle} />
          </Suspense>
        )}
      </Box>
    </Box>
  )
}

// SpecimensOverview.whyDidYouRender = true

export default SpecimensOverview
