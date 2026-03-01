import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Shield, Activity, Lock, Users, Zap, Heart, QrCode, FileText, Star, ChevronRight, CheckCircle, ArrowRight, Github, Twitter, Linkedin, Menu, X } from 'lucide-react';
import './LandingPage.css';

const features = [
    { icon: <Shield size={28} />, title: 'Secure Health Records', desc: 'Military-grade AES-256 encryption keeps your medical data private and protected at all times.' },
    { icon: <Activity size={28} />, title: 'Real-Time Monitoring', desc: 'Track vitals, prescriptions, and health metrics with live dashboards and trend charts.' },
    { icon: <Lock size={28} />, title: 'Role-Based Access', desc: 'Patients, doctors, and admins each get a tailored, permission-controlled experience.' },
    { icon: <QrCode size={28} />, title: 'Instant QR Access', desc: 'Share medical records instantly via secure QR codes in emergencies — zero paperwork.' },
    { icon: <FileText size={28} />, title: 'Digital Prescriptions', desc: 'Doctors write, sign, and send structured prescriptions digitally. Full audit trail included.' },
    { icon: <Users size={28} />, title: 'Multi-User Platform', desc: 'Seamlessly connect patients with healthcare providers in one unified, HIPAA-ready system.' },
];

const howItWorks = [
    { step: '01', title: 'Register & Verify', desc: 'Patients, doctors, and admins sign up and get their role-specific account verified in minutes.' },
    { step: '02', title: 'Scan or Access', desc: 'Doctors scan a patient\'s QR code at the clinic to instantly pull their full medical history.' },
    { step: '03', title: 'Prescribe & Store', desc: 'Digital prescriptions are written, encrypted, and stored permanently in the patient\'s vault.' },
];

const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'General Physician, Apollo Hospitals', text: 'MediVault has transformed how I manage patient records. The QR scan feature saves me 20 minutes per consultation and the digital prescription system is flawless.', avatar: 'P', stars: 5 },
    { name: 'Rahul Nair', role: 'Patient, Bangalore', text: 'Having all my medical history in one secure place and being able to share it instantly with any doctor via QR is a game changer. My entire family uses MediVault now.', avatar: 'R', stars: 5 },
    { name: 'Dr. Aisha Khan', role: 'Cardiologist, AIIMS Delhi', text: 'The dashboard is incredibly intuitive. I can view a patient\'s entire prescription history and vitals trends in seconds. This is truly the future of healthcare records.', avatar: 'A', stars: 5 },
];

const stats = [
    { value: 'HIPAA', label: 'Compliant Platform' },
    { value: 'AES-256', label: 'Encryption Standard' },
    { value: '< 200ms', label: 'API Response Time' },
    { value: '99.9%', label: 'Uptime SLA' },
];

export default function LandingPage() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isLoggedIn && user?.role) {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [isLoggedIn, user, navigate]);

    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* ── STICKY NAVBAR ── */}
            <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-brand">
                        <Shield size={22} style={{ color: 'var(--primary)' }} />
                        <span>MediVault</span>
                    </Link>
                    <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                        <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
                        <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
                        <Link to="/login" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>
                            Sign In <ArrowRight size={14} />
                        </Link>
                    </div>
                    <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Toggle menu">
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero-section" id="home">
                <div className="hero-bg" />
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
                            Get Started Free <ArrowRight size={16} />
                        </Link>
                        <a href="#how-it-works" className="btn-secondary-hero">
                            See How It Works
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
                {/* Product Mockup Preview */}
                <div className="hero-mockup">
                    <div className="mockup-browser">
                        <div className="mockup-bar">
                            <span className="mockup-dot red" /><span className="mockup-dot yellow" /><span className="mockup-dot green" />
                            <div className="mockup-url">medivault.app/dashboard/patient</div>
                        </div>
                        <div className="mockup-screen">
                            <div className="mockup-sidebar">
                                {['Dashboard', 'QR Vault', 'Prescriptions', 'Records', 'Profile'].map((item, i) => (
                                    <div key={item} className={`mockup-nav-item ${i === 0 ? 'active' : ''}`}>
                                        <div className="mockup-nav-dot" />{item}
                                    </div>
                                ))}
                            </div>
                                <div className="mockup-main">
                                <div className="mockup-greeting">Welcome back, Rahul</div>
                                <div className="mockup-cards-row">
                                    <div className="mockup-card blue"><div className="mockup-card-num">3</div><div className="mockup-card-label">Active Rx</div></div>
                                    <div className="mockup-card purple"><div className="mockup-card-num">12</div><div className="mockup-card-label">Records</div></div>
                                    <div className="mockup-card green"><div className="mockup-card-num">5</div><div className="mockup-card-label">Completed</div></div>
                                </div>
                                <div className="mockup-chart-lines">
                                    {[65, 80, 55, 90, 70, 85, 60].map((h, i) => (
                                        <div key={i} className="mockup-bar-item" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-scroll-indicator">
                    <div className="scroll-dot" />
                </div>
            </section>

            {/* ── FEATURES ── */}
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
                                <div className="feature-icon">
                                    {f.icon}
                                </div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="how-section" id="how-it-works">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Simple &amp; Fast</span>
                        <h2 className="section-title">How MediVault Works</h2>
                        <p className="section-subtitle">From signup to your first digital prescription in under 5 minutes.</p>
                    </div>
                    <div className="how-grid">
                        {howItWorks.map((h, idx) => (
                            <div key={h.step} className="how-card">
                                <div className="how-step-num" style={{ color: 'var(--primary)', borderColor: 'rgba(13, 148, 136, 0.35)' }}>{h.step}</div>
                                <h3 className="how-title">{h.title}</h3>
                                <p className="how-desc">{h.desc}</p>
                                {idx < howItWorks.length - 1 && (
                                    <div className="how-connector"><ChevronRight size={20} /></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="testimonials-section" id="testimonials">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">Trusted by Healthcare Professionals</span>
                        <h2 className="section-title">What Our Users Say</h2>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((t) => (
                            <div key={t.name} className="testimonial-card">
                                <div className="testimonial-stars">
                                {[...Array(t.stars)].map((_, i) => (
                                    <Star key={i} size={14} fill="#d97706" color="#d97706" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar" style={{ background: 'rgba(13, 148, 136, 0.12)', color: 'var(--primary)' }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="testimonial-name">{t.name}</p>
                                        <p className="testimonial-role">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section className="about-section" id="about">
                <div className="section-container">
                    <div className="about-grid">
                        <div className="about-content">
                            <span className="section-tag">About MediVault</span>
                            <h2 className="section-title">Built for the Future of Healthcare</h2>
                            <p className="about-text">
                                MediVault was built with a singular mission: to make medical
                                records universally accessible, secure, and interoperable. We
                                believe every patient deserves full control over their health data.
                            </p>
                            <p className="about-text">
                                Our platform bridges the gap between patients, doctors, and
                                administrators — creating a seamless ecosystem where health
                                information flows securely and efficiently.
                            </p>
                            <div className="about-highlights">
                                {[
                                    { label: 'HIPAA Compliant', icon: <Shield size={13} /> },
                                    { label: 'End-to-End Encrypted', icon: <Lock size={13} /> },
                                    { label: 'Cloud-Native', icon: <Zap size={13} /> },
                                    { label: 'Open Standards', icon: <CheckCircle size={13} /> },
                                ].map((h) => (
                                    <div key={h.label} className="highlight-chip">
                                        {h.icon} {h.label}
                                    </div>
                                ))}
                            </div>
                            <Link to="/login" className="btn-primary-hero" style={{ display: 'inline-flex', marginTop: '2rem' }}>
                                Join MediVault Today <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="about-visual">
                            <div className="visual-card">
                                <div className="visual-ring ring-1" />
                                <div className="visual-ring ring-2" />
                                <div className="visual-ring ring-3" />
                                <div className="visual-center">
                                    <Heart size={48} style={{ color: 'var(--primary)' }} />
                                    <span>MediVault</span>
                                    <span className="visual-sub">Healthcare Platform</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-card">
                        <div className="cta-badge"><Zap size={14} /> Ready to get started?</div>
                        <h2 className="cta-title">Secure Your Health Data Today</h2>
                        <p className="cta-subtitle">
                            Join healthcare providers and patients already using MediVault
                            for secure, paperless medical record management.
                        </p>
                        <div className="cta-actions">
                            <Link to="/login" className="btn-primary-hero">
                                Start for Free <ArrowRight size={16} />
                            </Link>
                            <a href="#features" className="btn-secondary-hero">
                                Explore Features
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <div className="section-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <Shield size={20} style={{ color: 'var(--primary-muted)' }} />
                                <span className="gradient-text" style={{ fontSize: '1.3rem', fontWeight: 800 }}>MediVault</span>
                            </div>
                            <p>Securing health records for a better tomorrow.</p>
                            <div className="footer-socials">
                                <a href="#" aria-label="GitHub"><Github size={17} /></a>
                                <a href="#" aria-label="Twitter"><Twitter size={17} /></a>
                                <a href="#" aria-label="LinkedIn"><Linkedin size={17} /></a>
                            </div>
                        </div>
                        <div className="footer-cols">
                            <div className="footer-col">
                                <p className="footer-col-title">Platform</p>
                                <a href="#features">Features</a>
                                <a href="#how-it-works">How It Works</a>
                                <a href="#about">About</a>
                                <Link to="/login">Sign In</Link>
                            </div>
                            <div className="footer-col">
                                <p className="footer-col-title">Roles</p>
                                <Link to="/login">Patient Portal</Link>
                                <Link to="/login">Doctor Dashboard</Link>
                                <Link to="/login">Admin Panel</Link>
                            </div>
                            <div className="footer-col">
                                <p className="footer-col-title">Security</p>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">HIPAA Compliance</a>
                                <a href="#">Security Audit</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 MediVault. All rights reserved. Built for better healthcare.</p>
                        <div className="footer-bottom-links">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
