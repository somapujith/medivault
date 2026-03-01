// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

const Toast = ({ id, message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="toast-icon" />;
            case 'error': return <AlertCircle size={20} className="toast-icon" />;
            default: return <Info size={20} className="toast-icon" />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`toast-root ${type}`}
        >
            <div>{getIcon()}</div>
            <p className="toast-message">{message}</p>
            <button
                type="button"
                onClick={() => onClose(id)}
                className="toast-close"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => (
    <div className="toast-container">
        <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={removeToast} />
            ))}
        </AnimatePresence>
    </div>
);

export default Toast;
