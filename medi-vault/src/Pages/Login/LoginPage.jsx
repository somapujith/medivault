import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Shield, Eye, EyeOff, LogIn, User, Lock, Activity, HeartPulse, Stethoscope, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
    { role: 'Patient', email: 'patient@medivault.com', password: 'patient123', color: '#0d9488', icon: HeartPulse, desc: 'View records & QR vault' },
    { role: 'Doctor', email: 'doctor@medivault.com', password: 'doctor123', color: '#1e40af', icon: Stethoscope, desc: 'Scan QR & prescribe' },
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

    return (
        <div className="login-page">
            <div className="login-bg" />

            <div className="login-container">
                <div className="login-left">
                    <Link to="/" className="login-logo">
                        <Shield size={32} style={{ color: 'var(--primary)' }} />
                        <span>MediVault</span>
                    </Link>

                    <h1 className="login-left-title">
                        Your Health,<br />
                        <span className="gradient-text">Your Control</span>
                    </h1>

                    <p className="login-left-subtitle">
                        Secure, accessible, and always available — the next generation
                        medical records platform designed for you.
                    </p>

                    <div className="feature-tags">
                        <span className="feature-tag"><Activity size={16} /> Real-time Data</span>
                        <span className="feature-tag"><HeartPulse size={16} /> Secure Vitals</span>
                    </div>

                    <div className="demo-accounts">
                        <p className="demo-label">Quick Demo Access</p>
                        <div className="demo-chips-grid">
                            {DEMO_ACCOUNTS.map((acc) => (
                                <button
                                    key={acc.role}
                                    className="demo-role-card"
                                    style={{ '--chip-color': acc.color }}
                                    onClick={() => fillDemo(acc)}
                                    type="button"
                                >
                                    <div className="demo-role-icon" style={{ background: `${acc.color}18`, color: acc.color }}>
                                        <acc.icon size={18} />
                                    </div>
                                    <div className="demo-role-info">
                                        <span className="demo-role-label">{acc.role}</span>
                                        <span className="demo-role-desc">{acc.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-card">
                        <div className="login-card-header">
                            <div className="login-icon-wrap">
                                <LogIn size={26} />
                            </div>
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
                                <div className="login-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                                id="login-submit-btn"
                            >
                                {loading ? (
                                    <span className="login-spinner" />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="login-footer-text">
                            <Shield size={14} /> Secured with 256-bit encryption
                        </p>
                        <p className="login-register-text">
                            New patient? <span className="register-link">Ask your healthcare provider to register you</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
