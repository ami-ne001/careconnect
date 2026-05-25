import { RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { appRouter } from '@/routes/AppRouter';
import { muiTheme } from '@/theme/muiTheme';

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <RouterProvider router={appRouter} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
