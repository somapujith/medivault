import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Shield, Eye, EyeOff, LogIn, User, Lock, Activity, HeartPulse, Stethoscope, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
    { role: 'Patient', email: 'patient@medivault.com', password: 'patient123', color: '#00d4ff', icon: HeartPulse, desc: 'View records & QR vault' },
    { role: 'Doctor', email: 'doctor@medivault.com', password: 'doctor123', color: '#7c3aed', icon: Stethoscope, desc: 'Scan QR & prescribe' },
    { role: 'Admin', email: 'admin@medivault.com', password: 'admin123', color: '#059669', icon: ShieldCheck, desc: 'Manage users & system' },
];

export default function LoginPage() {
    const { login, user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    const emailError = emailTouched && email && !emailValid ? 'Please enter a valid email address' : '';
    const passwordError = passwordTouched && password && !passwordValid ? 'Password must be at least 6 characters' : '';

    useEffect(() => {
        if (isLoggedIn && user?.role) {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [isLoggedIn, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate(`/dashboard/${result.user.role}`, { replace: true });
        } else {
            setError(result.error);
        }
    };

    const fillDemo = (account) => {
        setEmail(account.email);
        setPassword(account.password);
        setError('');
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 50, damping: 15 }
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                {/* Dynamic Floating Particles */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="login-particle"
                        initial={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: 0.2,
                            scale: 1,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, 50, 0],
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </div>

            <div className="login-container">
                {/* Left Panel - Hero Section */}
                <motion.div
                    className="login-left"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Link to="/" className="login-logo">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Shield size={36} color="var(--primary)" />
                            </motion.div>
                            <span style={{ color: 'var(--primary)' }}>MediVault</span>
                        </Link>
                    </motion.div>

                    <motion.h1 className="login-left-title" variants={itemVariants}>
                        Your Health,<br />
                        <motion.span
                            className="gradient-text"
                            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            style={{ backgroundSize: '200% auto' }}
                        >
                            Your Control
                        </motion.span>
                    </motion.h1>

                    <motion.p className="login-left-subtitle" variants={itemVariants} style={{ color: 'var(--text-muted)' }}>
                        Secure, accessible, and always available — the next generation
                        medical records platform designed for you.
                    </motion.p>

                    <motion.div className="feature-tags" variants={itemVariants} style={{ marginBottom: '2rem', display: 'flex', gap: '10px' }}>
                        <motion.div className="feature-tag" whileHover={{ scale: 1.05 }}>
                            <Activity size={16} /> Real-time Data
                        </motion.div>
                        <motion.div className="feature-tag" whileHover={{ scale: 1.05 }}>
                            <HeartPulse size={16} /> Secure Vitals
                        </motion.div>
                    </motion.div>

                    <motion.div className="demo-accounts" variants={itemVariants}>
                        <p className="demo-label">Quick Demo Access:</p>
                        <div className="demo-chips-grid">
                            {DEMO_ACCOUNTS.map((acc) => (
                                <motion.button
                                    key={acc.role}
                                    className="demo-role-card"
                                    style={{ '--chip-color': acc.color }}
                                    onClick={() => fillDemo(acc)}
                                    type="button"
                                    whileHover={{ scale: 1.02, translateY: -3 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <div className="demo-role-icon" style={{ background: `${acc.color}18`, color: acc.color }}>
                                        <acc.icon size={18} />
                                    </div>
                                    <div className="demo-role-info">
                                        <span className="demo-role-label">{acc.role}</span>
                                        <span className="demo-role-desc">{acc.desc}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Panel - Login Card */}
                <motion.div
                    className="login-right"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.3 }}
                >
                    <motion.div
                        className="login-card"
                        whileHover={{ translateY: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="login-card-header">
                            <motion.div
                                className="login-icon-wrap"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                            >
                                <LogIn size={28} color="var(--primary)" />
                            </motion.div>
                            <h2>Welcome Back</h2>
                            <p>Sign in to your MediVault account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className={`input-wrap ${emailError ? 'input-error' : emailTouched && email && emailValid ? 'input-success' : ''}`}>
                                    <User size={18} className="input-icon" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => setEmailTouched(true)}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                    {emailTouched && email && (
                                        emailValid
                                            ? <CheckCircle size={16} className="input-status-icon success" />
                                            : <AlertCircle size={16} className="input-status-icon error" />
                                    )}
                                </div>
                                {emailError && <span className="field-error">{emailError}</span>}
                            </div>

                            <div className="form-group">
                                <div className="form-label-row">
                                    <label htmlFor="password">Password</label>
                                    <button type="button" className="forgot-link">Forgot password?</button>
                                </div>
                                <div className={`input-wrap ${passwordError ? 'input-error' : passwordTouched && password && passwordValid ? 'input-success' : ''}`}>
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => setPasswordTouched(true)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordError && <span className="field-error">{passwordError}</span>}
                            </div>

                            {error && (
                                <motion.div
                                    className="login-error"
                                    role="alert"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                                id="login-submit-btn"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <span className="login-spinner" />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Sign In
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <motion.p
                            className="login-footer-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <Shield size={14} /> Secured with 256-bit encryption
                        </motion.p>
                        <motion.p
                            className="login-register-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            New patient? <span className="register-link">Ask your healthcare provider to register you</span>
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
