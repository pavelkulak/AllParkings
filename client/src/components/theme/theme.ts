import { PaletteMode } from "@mui/material";

export const getDesignTokens = (mode: PaletteMode) => ({
  typography: {
    fontFamily: ["Merriweather", "sans-serif"].join(","),
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
        pink: "f748bd",
      },
      text: {
        primary: '#fff',
        secondary: 'rgba(255, 255, 255, 0.7)',
      },
    }),
  },
});