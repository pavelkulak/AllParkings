import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getDesignTokens } from '../theme/theme';
import { CssBaseline } from '@mui/material';
import { ruRU } from '@mui/x-date-pickers/locales';

const ThemeContext = createContext({
  toggleTheme: () => {},
  mode: 'light' as 'light' | 'dark',
});

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(
    localStorage.getItem('themeMode') as 'light' | 'dark' || 'light'
  );

  const theme = createTheme(getDesignTokens(mode), ruRU);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};