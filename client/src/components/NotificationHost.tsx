import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { hideNotification } from '../redux/slices/uiSlice';
import Toast from './common/Toast';

export const NotificationHost = () => {
    const dispatch = useAppDispatch();
    const { open, message, severity } = useAppSelector((state) => state.ui.notification);

    const handleClose = () => {
        dispatch(hideNotification());
    };

    return (
        <Toast
            open={open}
            message={message}
            severity={severity}
            onClose={handleClose}
        />
    );
};
