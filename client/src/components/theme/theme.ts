import { PaletteMode, ThemeOptions } from "@mui/material";

declare module '@mui/material/styles' {
  interface TypeBackground {
    header?: string;
    footer?: string;
    pink?: string;
  }
}

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  typography: {
    fontFamily: ["Merriweather", "sans-serif"].join(","),
    h1: {
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.35rem',
      },
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.95rem',
      },
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    subtitle2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.95rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
    button: {
      textTransform: 'none', // More modern
    },
  },
  palette: {
    mode,
    ...(mode === 'light' ? {
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#42a5f5",
      },
      background: {
        default: "#fff",
        paper: "#fff",
        header: "#1976d2",
        footer: "#1976d2",
      },
    } : {
      primary: {
        main: "#90caf9",
      },
      secondary: {
        main: "#1976d2",
      },
      background: {
        default: "#121212",
        paper: "#1e1e1e",
        header: "#1e1e1e",
        footer: "#1e1e1e",
        pink: "#f748bd",
      },
      text: {
        primary: '#fff',
        secondary: 'rgba(255, 255, 255, 0.7)',
      },
    }),
  },
});