import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from './App'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const theme = createTheme({
  typography: {
    fontFamily: ["Merriweather", "sans-serif"].join(","),
  },
  palette: {
    primary: {
      main: "#1976d2", // Основной цвет
    },
    secondary: {
      main: "#42a5f5", // Вторичный цвет
    },
  },
});



createRoot(rootElement).render(
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <App />
      </Provider>
    </LocalizationProvider>
  </ThemeProvider>
);
