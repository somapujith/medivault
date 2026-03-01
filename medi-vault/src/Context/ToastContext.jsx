import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../Components/Common/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now().toString();
        const newToast = { id, message, type, duration };
        setToasts((prev) => [...prev, newToast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message) => {
        return showToast(message, 'success');
    }, [showToast]);

    const error = useCallback((message) => {
        return showToast(message, 'error');
    }, [showToast]);

    const info = useCallback((message) => {
        return showToast(message, 'info');
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, removeToast, success, error, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};
