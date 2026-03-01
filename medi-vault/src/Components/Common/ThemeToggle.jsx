// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';
// eslint-disable-next-line no-unused-vars
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
                <div
                    key={isDark ? "moon" : "sun"}
                >
                    {isDark ? (
                        <Moon size={14} style={{ color: 'var(--primary-muted)' }} />
                    ) : (
                        <Sun size={14} style={{ color: '#d97706' }} />
                    )}
                </div>
            </motion.div>
            <div className="theme-toggle-focus-ring" />
        </button>
    );
};

export default ThemeToggle;
