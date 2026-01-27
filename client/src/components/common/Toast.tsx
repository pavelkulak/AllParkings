import { Alert, Snackbar, SnackbarProps, AlertColor } from '@mui/material';
import { useState, useEffect } from 'react';

export interface ToastProps {
    open: boolean;
    message: string;
    severity?: AlertColor;
    autoHideDuration?: number;
    onClose: () => void;
    anchorOrigin?: SnackbarProps['anchorOrigin'];
}

export default function Toast({
    open,
    message,
    severity = 'info',
    autoHideDuration = 4000,
    onClose,
    anchorOrigin = { vertical: 'top', horizontal: 'center' },
}: ToastProps) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (open && autoHideDuration) {
            setProgress(100);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev - (100 / (autoHideDuration / 50));
                    return newProgress <= 0 ? 0 : newProgress;
                });
            }, 50);

            return () => clearInterval(interval);
        }
    }, [open, autoHideDuration]);

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={anchorOrigin}
            sx={{
                '& .MuiSnackbar-root': {
                    top: { xs: 16, sm: 24 },
                },
            }}
            TransitionProps={{
                onExited: () => setProgress(100),
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    width: '100%',
                    minWidth: { xs: '280px', sm: '320px' },
                    maxWidth: { xs: '90vw', sm: '500px' },
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '4px',
                        width: `${progress}%`,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'width 50ms linear',
                    },
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
