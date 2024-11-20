import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';
import { CustomThemeProvider } from './components/theme/ThemeContext';

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <CustomThemeProvider>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Provider store={store}>
        <App />
      </Provider>
    </LocalizationProvider>
  </CustomThemeProvider>
);
