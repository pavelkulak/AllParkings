import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertColor } from '@mui/material';

interface NotificationState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

interface UiState {
    notification: NotificationState;
}

const initialState: UiState = {
    notification: {
        open: false,
        message: '',
        severity: 'info',
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showNotification: (
            state,
            action: PayloadAction<{ message: string; severity?: AlertColor }>
        ) => {
            state.notification.open = true;
            state.notification.message = action.payload.message;
            state.notification.severity = action.payload.severity || 'info';
        },
        hideNotification: (state) => {
            state.notification.open = false;
        },
    },
});

export const { showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;
