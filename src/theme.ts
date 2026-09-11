import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3659a7' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#182033', secondary: '#5f6b7a' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.03em' },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e4e8f0',
          boxShadow: '0 4px 14px rgba(24, 32, 51, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 650 } },
    },
  },
});
