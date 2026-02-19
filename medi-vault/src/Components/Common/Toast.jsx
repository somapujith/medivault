import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const Toast = ({ id, message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-emerald-400" />;
            case 'error': return <AlertCircle size={20} className="text-red-400" />;
            default: return <Info size={20} className="text-blue-400" />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
            case 'error': return 'border-red-500/20 bg-red-500/10 text-red-100';
            default: return 'border-blue-500/20 bg-blue-500/10 text-blue-100';
        }
    };

    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg 
        pointer-events-auto min-w-[300px] max-w-md
        ${getStyles()}
      `}
        >
            <div className="flex-shrink-0">
                {getIcon()}
            </div>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={16} className="opacity-70" />
            </button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
