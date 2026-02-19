import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';
import { motion } from 'framer-motion';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            className={`theme-toggle-wrapper ${isDark ? 'dark' : ''}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            type="button"
        >
            <motion.div
                className="theme-toggle-handle"
                layout
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                }}
                animate={{
                    x: isDark ? 28 : 0,
                    backgroundColor: isDark ? '#1e293b' : '#ffffff' // Dark handle on dark mode, white on light
                }}
            >
                <motion.div
                    key={isDark ? "moon" : "sun"}
                    initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.2 }}
                >
                    {isDark ? (
                        <Moon size={14} color="#a78bfa" fill="#a78bfa" />
                    ) : (
                        <Sun size={14} color="#f59e0b" fill="#f59e0b" />
                    )}
                </motion.div>
            </motion.div>
            <div className="theme-toggle-focus-ring" />
        </button>
    );
};

export default ThemeToggle;
