import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Shield, Activity, Lock, Users, Zap, Heart } from 'lucide-react';
import './LandingPage.css';

const features = [
    {
        icon: <Shield size={32} />,
        title: 'Secure Health Records',
        desc: 'Military-grade encryption keeps your medical data private and protected at all times.',
        color: '#00d4ff',
    },
    {
        icon: <Activity size={32} />,
        title: 'Real-Time Monitoring',
        desc: 'Track vitals, appointments, and health metrics with live dashboards.',
        color: '#7c3aed',
    },
    {
        icon: <Lock size={32} />,
        title: 'Role-Based Access',
        desc: 'Patients, doctors, and admins each get a tailored, permission-controlled experience.',
        color: '#059669',
    },
    {
        icon: <Users size={32} />,
        title: 'Multi-User Platform',
        desc: 'Seamlessly connect patients with healthcare providers in one unified system.',
        color: '#d97706',
    },
    {
        icon: <Zap size={32} />,
        title: 'Instant QR Access',
        desc: 'Share medical records instantly via secure QR codes in emergencies.',
        color: '#dc2626',
    },
    {
        icon: <Heart size={32} />,
        title: 'Patient-Centered Care',
        desc: 'Designed around patient needs — intuitive, accessible, and always available.',
        color: '#ec4899',
    },
];

const stats = [
    { value: '50K+', label: 'Patients Served' },
    { value: '2K+', label: 'Doctors Registered' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '256-bit', label: 'Encryption Standard' },
];

export default function LandingPage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const heroRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn && user?.role) {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [isLoggedIn, user, navigate]);

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const scrollY = window.scrollY;
                heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section" id="home">
                <div className="hero-bg" ref={heroRef} />
                <div className="hero-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{ '--i': i }} />
                    ))}
                </div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <Shield size={14} />
                        <span>HIPAA Compliant &amp; Secure</span>
                    </div>
                    <h1 className="hero-title">
                        Your Health Records,
                        <br />
                        <span className="gradient-text">Secured &amp; Accessible</span>
                    </h1>
                    <p className="hero-subtitle">
                        MediVault is the next-generation medical records platform that puts
                        patients in control while empowering healthcare providers with the
                        tools they need.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login" className="btn-primary-hero">
                            Get Started Free
                        </Link>
                        <a href="#features" className="btn-secondary-hero">
                            Explore Features
                        </a>
                    </div>
                    <div className="hero-stats">
                        {stats.map((s) => (
                            <div key={s.label} className="hero-stat">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero-scroll-indicator">
                    <div className="scroll-dot" />
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Why MediVault?</span>
                        <h2 className="section-title">Everything You Need in One Place</h2>
                        <p className="section-subtitle">
                            A comprehensive platform built for the modern healthcare ecosystem.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((f) => (
                            <div key={f.title} className="feature-card">
                                <div className="feature-icon" style={{ color: f.color, '--glow': f.color }}>
                                    {f.icon}
                                </div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section" id="about">
                <div className="section-container">
                    <div className="about-grid">
                        <div className="about-content">
                            <span className="section-tag">About MediVault</span>
                            <h2 className="section-title">Built for the Future of Healthcare</h2>
                            <p className="about-text">
                                MediVault was founded with a singular mission: to make medical
                                records universally accessible, secure, and interoperable. We
                                believe every patient deserves control over their health data.
                            </p>
                            <p className="about-text">
                                Our platform bridges the gap between patients, doctors, and
                                administrators — creating a seamless ecosystem where health
                                information flows securely and efficiently.
                            </p>
                            <div className="about-highlights">
                                {['HIPAA Compliant', 'End-to-End Encrypted', 'Cloud-Native', 'Open Standards'].map((h) => (
                                    <div key={h} className="highlight-chip">
                                        <Shield size={14} />
                                        {h}
                                    </div>
                                ))}
                            </div>
                            <Link to="/login" className="btn-primary-hero" style={{ display: 'inline-flex', marginTop: '2rem' }}>
                                Join MediVault Today
                            </Link>
                        </div>
                        <div className="about-visual">
                            <div className="visual-card">
                                <div className="visual-ring ring-1" />
                                <div className="visual-ring ring-2" />
                                <div className="visual-ring ring-3" />
                                <div className="visual-center">
                                    <Heart size={48} color="#00d4ff" />
                                    <span>MediVault</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-card">
                        <h2 className="cta-title">Ready to Secure Your Health Data?</h2>
                        <p className="cta-subtitle">
                            Join thousands of patients and healthcare providers already using MediVault.
                        </p>
                        <Link to="/login" className="btn-primary-hero">
                            Start for Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>MediVault</span>
                            <p>Securing health records for a better tomorrow.</p>
                        </div>
                        <div className="footer-links">
                            <a href="#features">Features</a>
                            <a href="#about">About</a>
                            <Link to="/login">Login</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 MediVault. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
