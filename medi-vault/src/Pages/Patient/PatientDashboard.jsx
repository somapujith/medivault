import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useData } from '../../Context/DataContext';
import QRCode from 'react-qr-code';
import {
    LayoutDashboard, FileText, QrCode, Pill, User, LogOut,
    Bell, ChevronRight, Clock, Shield, Heart, Activity,
    Download, Eye, X, Calendar, AlertTriangle, Phone,
    Droplets, MapPin, CheckCircle, Upload, Plus, Check, Loader2,
} from 'lucide-react';
import { useToast } from '../../Context/ToastContext';
import Skeleton from '../../Components/Common/Skeleton';
import SearchInput from '../../Components/Common/SearchInput';
import EmptyState from '../../Components/Common/EmptyState';
import ThemeToggle from '../../Components/Common/ThemeToggle';
import VitalsChart from '../../Components/Common/VitalsChart';
import ProfileDropdown from '../../Components/Common/ProfileDropdown';
import './PatientDashboard.css';
import './PatientDashboardMobile.css';

const NAV = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vault', label: 'My QR Vault', icon: QrCode },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
];

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const dataCtx = useData();
    const { getPatientByUserId, getPrescriptionsForPatient, getDocumentsForPatient, addDocument } = dataCtx;
    const useDataRef = useRef(dataCtx);
    useEffect(() => { useDataRef.current = dataCtx; }, [dataCtx]);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = NAV.some(n => n.id === tabParam) ? tabParam : 'overview';
    const setActiveTab = (tab) => setSearchParams({ tab });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedRx, setSelectedRx] = useState(null);
    const printRef = useRef();

    const { success, error } = useToast(); // Toast hook
    const [loading, setLoading] = useState(true); // Loading state

    // Data State
    const [patient, setPatient] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Reset search when tab changes
    useEffect(() => { setSearchTerm(''); }, [activeTab]);

    const filteredRx = (Array.isArray(prescriptions) ? prescriptions : []).filter(rx =>
        rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDocs = (Array.isArray(documents) ? documents : []).filter(doc =>
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            if (user?.id) {
                try {
                    const p = await getPatientByUserId(user.id);
                    if (mounted && p) {
                        setPatient(p);
                        const [rxList, docList] = await Promise.all([
                            getPrescriptionsForPatient(p.id),
                            getDocumentsForPatient(p.id)
                        ]);
                        if (mounted) {
                            setPrescriptions(rxList || []);
                            setDocuments(docList || []);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load patient data", err);
                    error("Failed to load data");
                } finally {
                    if (mounted) setLoading(false);
                }
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [user, getPatientByUserId, getPrescriptionsForPatient, getDocumentsForPatient]);

    const activeRx = prescriptions.filter((r) => r.status === 'active');
    const qrValue = JSON.stringify({ patientId: patient.id, name: patient.name, v: 1 });

    const handleLogout = () => { logout(); navigate('/', { replace: true }); };

    // Upload modal state
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({ name: '', type: 'Lab Report', fileUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.name.trim()) return;
        setUploading(true);
        try {
            const { addDocument } = useDataRef.current;
            const newDoc = await addDocument({
                patientId: patient.id,
                name: uploadForm.name,
                type: uploadForm.type,
                uploadedBy: user.name,
                fileUrl: uploadForm.fileUrl || '#',
                size: '—',
            });
            setDocuments(prev => [newDoc, ...prev]);
            setUploadSuccess(true);
            success('Document uploaded successfully');
            setTimeout(() => {
                setShowUpload(false);
                setUploadForm({ name: '', type: 'Lab Report', fileUrl: '' });
                setUploadSuccess(false);
            }, 1500);
        } catch (err) {
            error('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = (doc) => {
        if (doc.fileUrl && doc.fileUrl !== '#') {
            window.open(doc.fileUrl, '_blank');
        } else {
            // Generate a simple text file with document info
            const content = `MediVault Document\n\nName: ${doc.name}\nType: ${doc.type || '—'}\nDate: ${doc.date}\nUploaded by: ${doc.uploadedBy}\n`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${doc.name}.txt`; a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handlePrint = () => {
        const content = printRef.current;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Prescription - ${selectedRx?.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        .rx-header { border-bottom: 2px solid #0099cc; padding-bottom: 12px; margin-bottom: 16px; }
        .rx-header h1 { color: #0099cc; font-size: 22px; }
        .rx-header p { font-size: 12px; color: #555; }
        .rx-section { margin-bottom: 14px; }
        .rx-section h3 { font-size: 13px; color: #0099cc; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; }
        .rx-section p, .rx-section li { font-size: 13px; color: #333; line-height: 1.6; }
        .med-row { border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
        .med-name { font-weight: bold; font-size: 14px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #888; }
        .sig { margin-top: 40px; text-align: right; }
        .sig-line { border-top: 1px solid #000; width: 200px; margin-left: auto; padding-top: 4px; font-size: 12px; }
      </style></head><body>${content.innerHTML}</body></html>`);
        win.document.close();
        win.print();
    };

    return (
        <div className="pd-layout">
            {/* Overlay for mobile */}
            {sidebarOpen && <div className="pd-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`pd-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="pd-sidebar-brand">
                    <img src="/logo.png" alt="MediVault" style={{ height: '32px', width: 'auto' }} />
                    <span style={{ marginLeft: '8px' }}>MediVault</span>
                </div>

                <div className="pd-sidebar-user">
                    <div className="pd-avatar-sm">{patient.name?.charAt(0) || 'P'}</div>
                    <div>
                        <p className="pd-user-name">{patient.name}</p>
                        <p className="pd-user-role">Patient · {patient.bloodGroup}</p>
                    </div>
                </div>

                <nav className="pd-nav">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`pd-nav-btn ${activeTab === id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                            id={`patient-nav-${id}`}
                        >
                            <Icon size={17} />
                            <span>{label}</span>
                            {activeTab === id && <ChevronRight size={13} className="pd-nav-arrow" />}
                        </button>
                    ))}
                </nav>

                <button className="pd-logout-btn" onClick={handleLogout} id="patient-logout">
                    <LogOut size={17} />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main */}
            <main className="pd-main">
                {/* Topbar */}
                <header className="pd-topbar">
                    <button className="pd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
                        <span /><span /><span />
                    </button>
                    <h1 className="pd-topbar-title">{NAV.find(n => n.id === activeTab)?.label}</h1>
                    <div className="pd-topbar-right">
                        <ThemeToggle />
                        <button className="pd-icon-btn" aria-label="Notifications">
                            <Bell size={18} />
                            <span className="pd-notif-dot" />
                        </button>
                        <ProfileDropdown user={user} role="patient" />
                    </div>
                </header>

                {/* Content */}
                <div className="pd-content">

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <div className="pd-tab">
                            <div className="pd-welcome">
                                <div>
                                    <h2>Welcome back, {patient.name?.split(' ')[0]} 👋</h2>
                                    <p>Your health vault is secure and up to date.</p>
                                </div>
                                <div className="pd-welcome-date">
                                    <Clock size={13} />
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="pd-stats-row">
                                {[
                                    { label: 'Active Prescriptions', value: activeRx.length, icon: Pill, color: '#00d4ff' },
                                    { label: 'Total Records', value: documents.length, icon: FileText, color: '#7c3aed' },
                                    { label: 'Past Prescriptions', value: prescriptions.filter(r => r.status === 'completed').length, icon: CheckCircle, color: '#10b981' },
                                    { label: 'Allergies on File', value: patient.allergies?.length || 0, icon: AlertTriangle, color: '#f59e0b' },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="pd-stat-card">
                                        <div className="pd-stat-icon" style={{ color }}><Icon size={20} /></div>
                                        <div>
                                            {loading ? (
                                                <Skeleton width="40px" height="24px" className="mb-1" />
                                            ) : (
                                                <p className="pd-stat-value" style={{ color }}>{value}</p>
                                            )}
                                            <p className="pd-stat-label">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Health Trends Chart */}
                            <div className="mb-6">
                                {loading ? <Skeleton height="300px" className="rounded-xl" /> : <VitalsChart />}
                            </div>

                            {/* Active prescriptions preview */}
                            {(activeRx.length > 0 || loading) && (
                                <>
                                    <div className="pd-section-label">Active Prescriptions</div>
                                    <div className="pd-rx-list">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <div key={i} className="pd-rx-card">
                                                    <Skeleton width="40px" height="40px" variant="circular" />
                                                    <div className="pd-rx-info" style={{ width: '100%' }}>
                                                        <Skeleton width="60%" height="1rem" className="mb-1" />
                                                        <Skeleton width="40%" height="0.8rem" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            activeRx.slice(0, 3).map((rx) => (
                                                <div key={rx.id} className="pd-rx-card" onClick={() => { setSelectedRx(rx); setActiveTab('prescriptions'); }}>
                                                    <div className="pd-rx-icon"><Pill size={20} color="#00d4ff" /></div>
                                                    <div className="pd-rx-info">
                                                        <p className="pd-rx-title">{rx.diagnosis}</p>
                                                        <p className="pd-rx-meta">{rx.doctorName} · {new Date(rx.issuedAt).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                    <span className="pd-badge active">Active</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Allergies & conditions */}
                            <div className="pd-two-col">
                                <div className="pd-info-card">
                                    <h3><AlertTriangle size={15} /> Allergies</h3>
                                    {patient.allergies?.length ? patient.allergies.map(a => (
                                        <span key={a} className="pd-tag red">{a}</span>
                                    )) : <p className="pd-empty-text">No known allergies</p>}
                                </div>
                                <div className="pd-info-card">
                                    <h3><Activity size={15} /> Chronic Conditions</h3>
                                    {patient.chronicConditions?.length ? patient.chronicConditions.map(c => (
                                        <span key={c} className="pd-tag blue">{c}</span>
                                    )) : <p className="pd-empty-text">None recorded</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── QR VAULT ── */}
                    {activeTab === 'vault' && (
                        <div className="pd-tab">
                            <div className="pd-vault-hero">
                                <div className="pd-vault-left">
                                    <div className="pd-vault-badge">
                                        <Shield size={14} /> Secure Digital Vault
                                    </div>
                                    <h2>Your Medical QR Code</h2>
                                    <p>
                                        Show this QR code to any registered MediVault doctor. They scan it to instantly
                                        access your medical profile and write a digital prescription — no paperwork needed.
                                    </p>
                                    <div className="pd-vault-steps">
                                        {[
                                            { n: '1', t: 'Open your QR Vault' },
                                            { n: '2', t: 'Show QR to your doctor' },
                                            { n: '3', t: 'Doctor scans & writes prescription' },
                                            { n: '4', t: 'Prescription saved in your vault' },
                                        ].map(s => (
                                            <div key={s.n} className="pd-vault-step">
                                                <div className="pd-step-num">{s.n}</div>
                                                <span>{s.t}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pd-vault-qr-wrap">
                                    <div className="pd-qr-card">
                                        <div className="pd-qr-header">
                                            <Shield size={16} color="#00d4ff" />
                                            <span>MediVault Secure ID</span>
                                        </div>
                                        <div className="pd-qr-box">
                                            <QRCode
                                                value={qrValue}
                                                size={200}
                                                bgColor="transparent"
                                                fgColor="#00d4ff"
                                                level="H"
                                            />
                                        </div>
                                        <div className="pd-qr-patient-info">
                                            <p className="pd-qr-name">{patient.name}</p>
                                            <p className="pd-qr-id">ID: {patient.id}</p>
                                            <div className="pd-qr-chips">
                                                <span><Droplets size={11} /> {patient.bloodGroup}</span>
                                                <span><Calendar size={11} /> {patient.dob}</span>
                                            </div>
                                        </div>
                                        <div className="pd-qr-footer">
                                            <Shield size={11} /> 256-bit encrypted · Valid for this session only
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent vault activity */}
                            <div className="pd-section-label">Recent Vault Activity</div>
                            <div className="pd-rx-list">
                                {prescriptions.slice(0, 5).map((rx) => (
                                    <div key={rx.id} className="pd-rx-card">
                                        <div className="pd-rx-icon"><FileText size={20} color="#7c3aed" /></div>
                                        <div className="pd-rx-info">
                                            <p className="pd-rx-title">Prescription by {rx.doctorName}</p>
                                            <p className="pd-rx-meta">{rx.diagnosis} · {new Date(rx.issuedAt).toLocaleString('en-IN')}</p>
                                        </div>
                                        <span className={`pd-badge ${rx.status}`}>{rx.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PRESCRIPTIONS ── */}
                    {activeTab === 'prescriptions' && (
                        <div className="pd-tab">
                            {selectedRx ? (
                                <PrescriptionViewer rx={selectedRx} onClose={() => setSelectedRx(null)} printRef={printRef} onPrint={handlePrint} />
                            ) : (
                                <>
                                    <div className="pd-section-label flex justify-between items-center mb-4">
                                        <span>All Prescriptions ({filteredRx.length})</span>
                                        <div className="w-64"><SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search prescriptions..." /></div>
                                    </div>
                                    <div className="pd-rx-list">
                                        {filteredRx.length === 0 && <EmptyState title="No prescriptions found" description="Try adjusting your search criteria" />}
                                        {filteredRx.map((rx) => (
                                            <div key={rx.id} className="pd-rx-card clickable" onClick={() => setSelectedRx(rx)}>
                                                <div className="pd-rx-icon"><Pill size={20} color="#00d4ff" /></div>
                                                <div className="pd-rx-info">
                                                    <p className="pd-rx-title">{rx.diagnosis}</p>
                                                    <p className="pd-rx-meta">{rx.doctorName} · {rx.doctorSpecialty}</p>
                                                    <p className="pd-rx-date">{new Date(rx.issuedAt).toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="pd-rx-right">
                                                    <span className={`pd-badge ${rx.status}`}>{rx.status}</span>
                                                    <Eye size={15} color="#475569" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── RECORDS ── */}
                    {activeTab === 'records' && (
                        <div className="pd-tab">
                            <div className="pd-records-header flex flex-col gap-4 mb-4">
                                <div className="flex justify-between items-center">
                                    <div className="pd-section-label" style={{ margin: 0 }}>Medical Documents ({filteredDocs.length})</div>
                                    <button className="pd-upload-btn" onClick={() => setShowUpload(true)}>
                                        <Plus size={14} /> Upload Document
                                    </button>
                                </div>
                                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search documents..." />
                            </div>

                            {/* Upload Modal */}
                            {showUpload && (
                                <div className="pd-modal-overlay" onClick={() => setShowUpload(false)}>
                                    <div className="pd-modal" onClick={e => e.stopPropagation()}>
                                        <div className="pd-modal-header">
                                            <h3><Upload size={16} /> Add Document</h3>
                                            <button onClick={() => setShowUpload(false)}><X size={16} /></button>
                                        </div>
                                        <form onSubmit={handleUpload} className="pd-modal-form">
                                            <label>Document Name *</label>
                                            <input required placeholder="e.g. Blood Test Report" value={uploadForm.name}
                                                onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))} />
                                            <label>Document Type</label>
                                            <select value={uploadForm.type} onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))}>
                                                {['Lab Report', 'X-Ray', 'MRI Scan', 'Prescription', 'Discharge Summary', 'Insurance', 'Other'].map(t =>
                                                    <option key={t}>{t}</option>)}
                                            </select>
                                            <label>File URL (optional)</label>
                                            <input placeholder="https://..." value={uploadForm.fileUrl}
                                                onChange={e => setUploadForm(f => ({ ...f, fileUrl: e.target.value }))} />
                                            <button
                                                type="submit"
                                                className="pd-modal-submit"
                                                disabled={uploading || uploadSuccess}
                                                style={{ backgroundColor: uploadSuccess ? '#10b981' : '' }}
                                            >
                                                {uploading ? (
                                                    <><Loader2 className="animate-spin" size={16} /> Saving...</>
                                                ) : uploadSuccess ? (
                                                    <><Check size={16} /> Saved</>
                                                ) : (
                                                    'Save Document'
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="pd-docs-list">
                                {filteredDocs.length === 0 && <EmptyState title="No documents found" description="Try adjusting your search or upload a new one" />}
                                {filteredDocs.map((doc) => (
                                    <div key={doc.id} className="pd-doc-card">
                                        <div className="pd-doc-icon"><FileText size={22} color="#00d4ff" /></div>
                                        <div className="pd-doc-info">
                                            <p className="pd-doc-name">{doc.name}</p>
                                            <p className="pd-doc-meta">{doc.type} · Uploaded by {doc.uploadedBy}</p>
                                        </div>
                                        <div className="pd-doc-right">
                                            <span className="pd-doc-date">{typeof doc.date === 'string' ? doc.date : new Date(doc.date).toLocaleDateString('en-IN')}</span>
                                            <span className="pd-doc-size">{doc.size}</span>
                                        </div>
                                        <button className="pd-doc-btn" onClick={() => handleDownload(doc)} title="Download"><Download size={15} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PROFILE ── */}
                    {activeTab === 'profile' && (
                        <div className="pd-tab">
                            <div className="pd-profile-card">
                                <div className="pd-profile-top">
                                    <div className="pd-avatar-lg">{patient.name?.charAt(0)}</div>
                                    <div>
                                        <h2>{patient.name}</h2>
                                        <p>{patient.email}</p>
                                        <span className="pd-role-chip">Patient</span>
                                    </div>
                                </div>
                                <div className="pd-profile-grid">
                                    {[
                                        { icon: Calendar, label: 'Date of Birth', value: patient.dob },
                                        { icon: Droplets, label: 'Blood Group', value: patient.bloodGroup },
                                        { icon: Phone, label: 'Phone', value: patient.phone },
                                        { icon: MapPin, label: 'Address', value: patient.address },
                                        { icon: Shield, label: 'Insurance ID', value: patient.insuranceId },
                                        { icon: Heart, label: 'Gender', value: patient.gender },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="pd-profile-row">
                                            <div className="pd-profile-row-label"><Icon size={14} />{label}</div>
                                            <div className="pd-profile-row-value">{value || '—'}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pd-profile-section">
                                    <h3><AlertTriangle size={15} /> Allergies</h3>
                                    <div className="pd-tag-row">
                                        {patient.allergies?.map(a => <span key={a} className="pd-tag red">{a}</span>)}
                                        {!patient.allergies?.length && <span className="pd-empty-text">None</span>}
                                    </div>
                                </div>
                                <div className="pd-profile-section">
                                    <h3><Activity size={15} /> Chronic Conditions</h3>
                                    <div className="pd-tag-row">
                                        {patient.chronicConditions?.map(c => <span key={c} className="pd-tag blue">{c}</span>)}
                                        {!patient.chronicConditions?.length && <span className="pd-empty-text">None</span>}
                                    </div>
                                </div>
                                <div className="pd-profile-section">
                                    <h3><Phone size={15} /> Emergency Contact</h3>
                                    <div className="pd-emergency-card">
                                        <p className="pd-ec-name">{patient.emergencyContactName || '—'}</p>
                                        <p className="pd-ec-meta">
                                            {patient.emergencyContactRelation || '—'}
                                            {' · '}
                                            {patient.emergencyContactPhone || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

// ─── Prescription Viewer Component ────────────────────────────────────────────
function PrescriptionViewer({ rx, onClose, printRef, onPrint }) {
    if (!rx) return null;
    return (
        <div className="pd-rx-viewer">
            <div className="pd-rx-viewer-topbar">
                <button className="pd-back-btn" onClick={onClose}><X size={16} /> Back to Prescriptions</button>
                <button className="pd-print-btn" onClick={onPrint}><Download size={15} /> Print / Download</button>
            </div>

            {/* Printable content */}
            <div className="pd-rx-letter" ref={printRef}>
                {/* Letterhead */}
                <div className="rx-letterhead">
                    <div className="rx-lh-left">
                        <div className="rx-lh-logo">
                            <img src="/logo.png" alt="MediVault" style={{ height: '36px', width: 'auto', marginRight: '8px' }} />
                            <span>MediVault</span>
                        </div>
                        <p className="rx-lh-hospital">{rx.doctorHospital}</p>
                    </div>
                    <div className="rx-lh-right">
                        <p className="rx-lh-doctor">{rx.doctorName}</p>
                        <p>{rx.doctorSpecialty}</p>
                        <p>License: {rx.doctorLicense}</p>
                        <p>Phone: {rx.doctorPhone}</p>
                    </div>
                </div>

                <div className="rx-divider" />

                {/* Prescription title + timestamp */}
                <div className="rx-title-row">
                    <div>
                        <h2 className="rx-title">Medical Prescription</h2>
                        <p className="rx-id">Ref: {rx.id}</p>
                    </div>
                    <div className="rx-timestamp">
                        <Clock size={13} />
                        {new Date(rx.issuedAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </div>
                </div>

                {/* Patient info */}
                <div className="rx-patient-box">
                    <div className="rx-patient-row">
                        <span className="rx-field-label">Patient Name</span>
                        <span className="rx-field-value">{rx.patientName || 'Alex Johnson'}</span>
                    </div>
                    <div className="rx-patient-row">
                        <span className="rx-field-label">Visit Reason</span>
                        <span className="rx-field-value">{rx.visitReason}</span>
                    </div>
                </div>

                {/* Symptoms */}
                <div className="rx-section">
                    <h3 className="rx-section-title">Symptoms & Observations</h3>
                    <p className="rx-section-body">{rx.symptoms}</p>
                </div>

                {/* Diagnosis */}
                <div className="rx-section">
                    <h3 className="rx-section-title">Diagnosis</h3>
                    <p className="rx-section-body rx-diagnosis">{rx.diagnosis}</p>
                </div>

                {/* Medications */}
                <div className="rx-section">
                    <h3 className="rx-section-title">Prescribed Medications</h3>
                    <div className="rx-meds-list">
                        {rx.medications?.map((med, i) => (
                            <div key={i} className="rx-med-row">
                                <div className="rx-med-num">{i + 1}</div>
                                <div className="rx-med-info">
                                    <p className="rx-med-name">{med.name} <span className="rx-med-dose">{med.dose}</span></p>
                                    <p className="rx-med-detail">{med.frequency} · {med.duration}</p>
                                    {med.instructions && <p className="rx-med-note">⚠ {med.instructions}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lab tests */}
                {rx.labTests?.length > 0 && (
                    <div className="rx-section">
                        <h3 className="rx-section-title">Recommended Tests</h3>
                        <div className="rx-tests-list">
                            {rx.labTests.map((t, i) => <span key={i} className="rx-test-chip">{t}</span>)}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {rx.notes && (
                    <div className="rx-section">
                        <h3 className="rx-section-title">Doctor's Notes</h3>
                        <p className="rx-section-body rx-notes">{rx.notes}</p>
                    </div>
                )}

                {/* Follow-up */}
                {rx.followUp && (
                    <div className="rx-followup">
                        <Calendar size={14} />
                        <span>Follow-up appointment: <strong>{rx.followUp}</strong></span>
                    </div>
                )}

                {/* Signature */}
                <div className="rx-signature">
                    <div className="rx-sig-line">
                        <p className="rx-sig-name">{rx.doctorName}</p>
                        <p className="rx-sig-label">Doctor's Signature</p>
                    </div>
                    <div className="rx-sig-stamp">
                        <Shield size={14} />
                        <span>Digitally verified by MediVault</span>
                    </div>
                </div>

                <div className="rx-footer">
                    This prescription was generated digitally via MediVault. Ref: {rx.id} · {new Date(rx.issuedAt).toISOString()}
                </div>
            </div>
        </div>
    );
}
