import { createTheme } from '@mui/material/styles'
import { blue, red, pink } from '@mui/material/colors'
import { APP_WITH_EDITING_ENABLED } from './utils/constants'

// A custom theme for this app
const theme = createTheme({
  typography: {
    fontSize: 12,
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: 12,
        },
      },
    },
  },
  // components: {
  //   MuiDatePicker: {
  //     styleOverrides: {
  //       root: {
  //         backgroundColor: 'red',
  //       },
  //     },
  //   },
  //   MuiDataGrid: {
  //     styleOverrides: {
  //       root: {
  //         backgroundColor: 'red',
  //       },
  //     },
  //   },
  // },
  palette: {
    primary: {
      main: APP_WITH_EDITING_ENABLED ? pink[900] : blue['900'],
    },
    error: {
      main: red.A400,
    },
  },
})

export default theme
