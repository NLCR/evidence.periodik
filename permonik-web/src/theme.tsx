import { createTheme } from '@mui/material/styles'
import { blue, red } from '@mui/material/colors'

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
      main: blue['900'],
    },
    error: {
      main: red.A400,
    },
  },
})

export default theme
