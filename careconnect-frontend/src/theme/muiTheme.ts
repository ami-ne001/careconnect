import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1e3a5f',
    },
    secondary: {
      main: '#0ea5e9',
    },
    background: {
      default: '#f4f7fb',
    },
  },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
});
