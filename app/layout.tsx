"use client"
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../lib/mui-theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}