import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#005bc6',
      light: '#4d87e0',
      dark: '#003f8a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f4a261',
      light: '#f7c08a',
      dark: '#c77a3e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    error: {
      main: '#e53e3e',
    },
    success: {
      main: '#38a169',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: '20px', fontWeight: 600 },
    h2: { fontSize: '18px', fontWeight: 500 },
    body1: { fontSize: '16px' },
    body2: { fontSize: '14px' },
  },
});