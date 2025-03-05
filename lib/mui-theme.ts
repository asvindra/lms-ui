import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#005bc6', // Main primary color
      light: '#e6f0fa',
      dark: '#00479b',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f4a261', // Secondary color
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: '20px' },
    h2: { fontSize: '18px' },
    body1: { fontSize: '16px' },
    body2: { fontSize: '14px' },
  },
});