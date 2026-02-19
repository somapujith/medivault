import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useData } from '../../Context/DataContext';
import {
    LayoutDashboard, Users, QrCode, FileText, User, LogOut,
    Bell, ChevronRight, Clock, Shield, Scan, CheckCircle,
    Plus, Trash2, X, Pill, AlertTriangle, Activity,
    Phone, Calendar, Droplets, Save, Printer, ChevronDown,
} from 'lucide-react';
import { prescriptionApi } from '../../Api/ApiClient';
import { useToast } from '../../Context/ToastContext';
import SearchInput from '../../Components/Common/SearchInput';
import EmptyState from '../../Components/Common/EmptyState';
import ThemeToggle from '../../Components/Common/ThemeToggle';
import ProfileDropdown from '../../Components/Common/ProfileDropdown';
import './DoctorDashboard.css';
import './DoctorDashboardMobile.css';

const NAV = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scan Patient QR', icon: QrCode },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'prescriptions', label: 'Prescriptions Issued', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
];

const EMPTY_MED = { name: '', dose: '', frequency: '', duration: '', instructions: '' };
const EMPTY_RX = {
    visitReason: '',
    symptoms: '',
    diagnosis: '',
    medications: [{ ...EMPTY_MED }],
    labTests: '',
    followUp: '',
    notes: '',
};

export default function DoctorDashboard() {
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const { getAllPatients, getPrescriptionsByDoctor, addPrescription, startScanSession, clearScanSession, scannedPatient } = useData();
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = NAV.some(n => n.id === tabParam) ? tabParam : 'overview';
    const setActiveTab = (tab) => setSearchParams({ tab });
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data State
    const [myPatients, setMyPatients] = useState([]);
    const [myPrescriptions, setMyPrescriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { setSearchTerm(''); }, [activeTab]);

    const filteredPatients = (Array.isArray(myPatients) ? myPatients : []).filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRx = (Array.isArray(myPrescriptions) ? myPrescriptions : []).filter(rx =>
        rx.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            if (user?.id) {
                try {
                    const [pats, rxs] = await Promise.all([
                        getAllPatients(),
                        getPrescriptionsByDoctor(user.id)
                    ]);
                    if (mounted) {
                        setMyPatients(pats || []);
                        setMyPrescriptions(rxs || []);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        loadData();
        return () => { mounted = false; };
    }, [user, getAllPatients, getPrescriptionsByDoctor]);

    // Scanner state
    const [scanInput, setScanInput] = useState('');
    const [scanError, setScanError] = useState('');
    const [scanSuccess, setScanSuccess] = useState(false);

    // Prescription form
    const [rxForm, setRxForm] = useState(EMPTY_RX);
    const [rxSaved, setRxSaved] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const printRef = useRef();

    // Dropdown States
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New patient scan from ER', time: '5m ago', read: false },
        { id: 2, text: 'Lab results ready for Patient P003', time: '1h ago', read: false },
        { id: 3, text: 'System maintenance scheduled', time: '2h ago', read: true },
    ]);

    const handleLogout = () => { logout(); navigate('/', { replace: true }); };

    // Patient History
    const [patientHistory, setPatientHistory] = useState([]);

    // ── QR Simulation ──
    const handleSimulateScan = async (patientId) => {
        setScanError('');
        try {
            const found = await startScanSession(patientId);
            if (found) {
                setScanSuccess(true);
                setRxForm(EMPTY_RX);
                setRxSaved(null);
                setShowPreview(false);

                // Fetch patient history
                const history = await getPrescriptionsForPatient(found.id);
                setPatientHistory(history || []);
            } else {
                setScanError('Patient not found. Invalid QR code.');
            }
        } catch (err) {
            setScanError('Patient not found. Invalid QR code.');
        }
    };

    const handleManualScan = () => {
        try {
            const parsed = JSON.parse(scanInput);
            handleSimulateScan(parsed.patientId);
        } catch {
            // Try as plain patient ID
            handleSimulateScan(scanInput.trim());
        }
    };

    const handleClearScan = () => {
        clearScanSession();
        setScanSuccess(false);
        setScanInput('');
        setScanError('');
        setRxForm(EMPTY_RX);
        setRxSaved(null);
        setShowPreview(false);
        setPatientHistory([]);
    };

    // ── Prescription form helpers ──
    const updateMed = (i, field, val) => {
        const meds = [...rxForm.medications];
        meds[i] = { ...meds[i], [field]: val };
        setRxForm(f => ({ ...f, medications: meds }));
    };
    const addMed = () => setRxForm(f => ({ ...f, medications: [...f.medications, { ...EMPTY_MED }] }));
    const removeMed = (i) => setRxForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

    const handleSaveRx = async () => {
        if (!scannedPatient) return;
        if (!rxForm.diagnosis.trim()) { error('Please enter a diagnosis.'); return; }
        const rx = await addPrescription({
            patientId: scannedPatient.id,
            patientName: scannedPatient.name,
            doctorId: user.id || 0,
            doctorName: user.name,
            doctorSpecialty: user.specialty || 'General Medicine',
            doctorLicense: user.license || 'MD-2024-001',
            doctorHospital: user.hospital || 'MediVault General Hospital',
            doctorPhone: user.phone || '',
            visitReason: rxForm.visitReason,
            symptoms: rxForm.symptoms,
            diagnosis: rxForm.diagnosis,
            medications: rxForm.medications.filter(m => m.name.trim()),
            labTests: rxForm.labTests ? rxForm.labTests.split(',').map(t => t.trim()).filter(Boolean) : [],
            followUp: rxForm.followUp,
            notes: rxForm.notes,
        });
        setRxSaved(rx);
        setShowPreview(true);
        // Refresh prescriptions list
        const updatedRxs = await getPrescriptionsByDoctor(user.id);
        setMyPrescriptions(updatedRxs || []);
    };

    const handleUpdateStatus = async (rxId, newStatus) => {
        try {
            await prescriptionApi.updateStatus(rxId, newStatus);
            const updatedRxs = await getPrescriptionsByDoctor(user.id);
            setMyPrescriptions(updatedRxs || []);
            setMyPrescriptions(updatedRxs || []);
            success('Status updated successfully');
        } catch (err) {
            error('Failed to update status: ' + err.message);
        }
    };

    const handlePrint = () => {
        const content = printRef.current;
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>Prescription</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#111;max-width:800px;margin:auto}
        .lh{display:flex;justify-content:space-between;border-bottom:2px solid #0099cc;padding-bottom:12px;margin-bottom:16px}
        .lh-logo{font-size:20px;font-weight:bold;color:#0099cc}
        .lh-right{text-align:right;font-size:12px;color:#444;line-height:1.6}
        .rx-title{font-size:18px;font-weight:bold;color:#0099cc;margin:12px 0 4px}
        .ts{font-size:11px;color:#888}
        .pbox{background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:10px 14px;margin:12px 0}
        .pbox p{font-size:13px;margin:3px 0}
        .sec-title{font-size:12px;font-weight:bold;text-transform:uppercase;color:#0099cc;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin:14px 0 8px}
        .sec-body{font-size:13px;color:#333;line-height:1.6}
        .med{border:1px solid #ddd;border-radius:6px;padding:8px 12px;margin-bottom:8px}
        .med-name{font-weight:bold;font-size:14px}
        .med-detail{font-size:12px;color:#555}
        .chip{display:inline-block;background:#e0f2fe;color:#0369a1;padding:3px 10px;border-radius:100px;font-size:11px;margin:3px}
        .followup{background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:8px 14px;font-size:13px;margin-top:14px}
        .sig{margin-top:40px;display:flex;justify-content:flex-end}
        .sig-inner{text-align:center;border-top:1px solid #000;padding-top:6px;width:200px}
        .footer{margin-top:20px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:8px}
      </style></head><body>${content.innerHTML}</body></html>`);
        win.document.close();
        win.print();
    };

    return (
        <div className="dd-layout">
            {sidebarOpen && <div className="dd-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`dd-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dd-sidebar-brand">
                    <img src="/logo.png" alt="MediVault" style={{ height: '32px', width: 'auto' }} />
                    <span style={{ marginLeft: '8px' }}>MediVault</span>
                </div>
                <div className="dd-sidebar-user">
                    <div className="dd-avatar-sm">{user?.name?.charAt(0) || 'D'}</div>
                    <div>
                        <p className="dd-user-name">{user?.name}</p>
                        <p className="dd-user-role">{user?.specialty || 'Doctor'}</p>
                    </div>
                </div>
                <nav className="dd-nav">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`dd-nav-btn ${activeTab === id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                            id={`doctor-nav-${id}`}
                        >
                            <Icon size={17} />
                            <span>{label}</span>
                            {activeTab === id && <ChevronRight size={13} className="dd-nav-arrow" />}
                        </button>
                    ))}
                </nav>
                <button className="dd-logout-btn" onClick={handleLogout} id="doctor-logout">
                    <LogOut size={17} /><span>Sign Out</span>
                </button>
            </aside>

            {/* Main */}
            <main className="dd-main">
                <header className="dd-topbar">
                    <button className="dd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
                        <span /><span /><span />
                    </button>
                    <h1 className="dd-topbar-title">{NAV.find(n => n.id === activeTab)?.label}</h1>
                    <div className="dd-topbar-right">
                        <ThemeToggle />
                        {/* Notifications */}
                        <div className="dd-notif-wrap">
                            <button
                                className="dd-icon-btn"
                                aria-label="Notifications"
                                onClick={() => setNotifOpen(!notifOpen)}
                            >
                                <Bell size={18} />
                                {notifications.length > 0 && <span className="dd-notif-dot" />}
                            </button>

                            {notifOpen && (
                                <>
                                    <div className="dd-dropdown-menu dd-notif-menu">
                                        <div className="dd-dropdown-header">
                                            <h3>Notifications</h3>
                                            <button className="dd-link-btn" onClick={() => setNotifications([])}>Clear all</button>
                                        </div>
                                        <div className="dd-notif-list">
                                            {notifications.length === 0 ? (
                                                <div className="dd-empty-state">No new notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="dd-notif-item">
                                                        <div className="dd-notif-icon"><Activity size={14} /></div>
                                                        <div>
                                                            <p className="dd-notif-text">{n.text}</p>
                                                            <span className="dd-notif-time">{n.time}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    <div className="dd-backdrop" onClick={() => setNotifOpen(false)} />
                                </>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <ProfileDropdown user={user} role="doctor" />
                    </div>
                </header>

                <div className="dd-content">

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <div className="dd-tab">
                            <div className="dd-welcome">
                                <div>
                                    <h2>Good day, {user?.name} 🩺</h2>
                                    <p>{user?.specialty} · {user?.hospital || 'MediVault General Hospital'}</p>
                                </div>
                                <div className="dd-welcome-date"><Clock size={13} />
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="dd-stats-row">
                                {[
                                    { label: 'Total Patients', value: myPatients.length, icon: Users, color: '#7c3aed' },
                                    { label: 'Prescriptions Issued', value: myPrescriptions.length, icon: FileText, color: '#00d4ff' },
                                    { label: 'Active Prescriptions', value: myPrescriptions.filter(r => r.status === 'active').length, icon: Pill, color: '#10b981' },
                                    { label: 'Pending Follow-ups', value: myPrescriptions.filter(r => r.followUp && new Date(r.followUp) > new Date()).length, icon: Calendar, color: '#f59e0b' },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="dd-stat-card">
                                        <div className="dd-stat-icon" style={{ color }}><Icon size={20} /></div>
                                        <div>
                                            <p className="dd-stat-value" style={{ color }}>{value}</p>
                                            <p className="dd-stat-label">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="dd-section-label">Quick Action</div>
                            <div className="dd-quick-action" onClick={() => setActiveTab('scanner')}>
                                <div className="dd-qa-icon"><Scan size={28} color="#7c3aed" /></div>
                                <div>
                                    <p className="dd-qa-title">Scan Patient QR Code</p>
                                    <p className="dd-qa-desc">Scan a patient's QR to access their profile and write a prescription</p>
                                </div>
                                <ChevronRight size={20} color="#475569" />
                            </div>

                            <div className="dd-section-label">Recent Prescriptions</div>
                            <div className="dd-rx-list">
                                {myPrescriptions.slice(0, 5).map(rx => (
                                    <div key={rx.id} className="dd-rx-card">
                                        <div className="dd-rx-icon"><FileText size={18} color="#7c3aed" /></div>
                                        <div className="dd-rx-info">
                                            <p className="dd-rx-title">{rx.patientName || 'Patient'} — {rx.diagnosis}</p>
                                            <p className="dd-rx-meta">{new Date(rx.issuedAt).toLocaleString('en-IN')}</p>
                                        </div>
                                        <span className={`dd-badge ${rx.status}`}>{rx.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── SCANNER ── */}
                    {activeTab === 'scanner' && (
                        <div className="dd-tab">
                            {!scannedPatient ? (
                                <div className="dd-scanner-section">
                                    <div className="dd-scanner-card">
                                        <div className="dd-scanner-icon-wrap">
                                            <div className="dd-scanner-pulse" />
                                            <Scan size={40} color="#7c3aed" />
                                        </div>
                                        <h2>Scan Patient QR Code</h2>
                                        <p>Use your device camera to scan the patient's MediVault QR code, or select a patient below to simulate a scan.</p>

                                        {/* Manual QR input */}
                                        <div className="dd-scan-input-wrap">
                                            <input
                                                type="text"
                                                className="dd-scan-input"
                                                placeholder='Paste QR data or Patient ID (e.g. P001)'
                                                value={scanInput}
                                                onChange={e => setScanInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleManualScan()}
                                            />
                                            <button className="dd-scan-btn" onClick={handleManualScan}>
                                                <Scan size={16} /> Scan
                                            </button>
                                        </div>

                                        {scanError && <div className="dd-scan-error"><AlertTriangle size={14} /> {scanError}</div>}

                                        <div className="dd-scan-divider"><span>or select patient to simulate</span></div>

                                        <div className="dd-patient-select-list">
                                            {(Array.isArray(myPatients) ? myPatients : []).map(p => (
                                                <button key={p.id} className="dd-patient-select-btn" onClick={() => handleSimulateScan(p.id)}>
                                                    <div className="dd-ps-avatar">{p.name?.charAt(0)}</div>
                                                    <div className="dd-ps-info">
                                                        <span className="dd-ps-name">{p.name}</span>
                                                        <span className="dd-ps-meta">ID: {p.id} · {p.bloodGroup} · {p.gender}</span>
                                                    </div>
                                                    <QrCode size={16} color="#7c3aed" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="dd-prescription-workspace">
                                    {/* Patient info panel */}
                                    <div className="dd-patient-panel">
                                        <div className="dd-pp-header">
                                            <div className="dd-pp-avatar">{scannedPatient.name.charAt(0)}</div>
                                            <div>
                                                <h3>{scannedPatient.name}</h3>
                                                <p>ID: {scannedPatient.id}</p>
                                            </div>
                                            <button className="dd-clear-btn" onClick={handleClearScan} title="Clear scan session">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="dd-pp-chips">
                                            <span><Droplets size={11} /> {scannedPatient.bloodGroup}</span>
                                            <span><Calendar size={11} /> {scannedPatient.dob}</span>
                                            <span>{scannedPatient.gender}</span>
                                        </div>
                                        {scannedPatient.allergies?.length > 0 && (
                                            <div className="dd-pp-allergy">
                                                <AlertTriangle size={13} color="#f59e0b" />
                                                <span>Allergies: {scannedPatient.allergies.join(', ')}</span>
                                            </div>
                                        )}
                                        {scannedPatient.chronicConditions?.length > 0 && (
                                            <div className="dd-pp-conditions">
                                                <Activity size={13} color="#00d4ff" />
                                                <span>Conditions: {scannedPatient.chronicConditions.join(', ')}</span>
                                            </div>
                                        )}
                                        <div className="dd-scan-success">
                                            <CheckCircle size={14} color="#10b981" />
                                            <span>QR verified · Ready to prescribe</span>
                                        </div>

                                        {/* Patient History */}
                                        <div className="dd-history-section">
                                            <h4 className="dd-history-title">Previous Prescriptions</h4>
                                            {patientHistory.length === 0 ? (
                                                <p className="dd-history-empty">No previous records found.</p>
                                            ) : (
                                                <div className="dd-history-list">
                                                    {patientHistory.map(rx => {
                                                        const isSameHospital = rx.doctorHospital === (user.hospital || 'MediVault General Hospital');
                                                        return (
                                                            <div key={rx.id} className={`dd-history-item ${isSameHospital ? 'highlight' : ''}`}>
                                                                <div className="dd-hist-header">
                                                                    <span className="dd-hist-date">{new Date(rx.issuedAt).toLocaleDateString()}</span>
                                                                    {isSameHospital && <span className="dd-badge-sm">Same Hospital</span>}
                                                                </div>
                                                                <p className="dd-hist-doc">{rx.doctorName} ({rx.doctorSpecialty})</p>
                                                                <p className="dd-hist-hosp">{rx.doctorHospital}</p>
                                                                <p className="dd-hist-diag">{rx.diagnosis}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prescription form */}
                                    {!showPreview ? (
                                        <div className="dd-rx-form">
                                            <div className="dd-rx-form-header">
                                                <FileText size={18} color="#7c3aed" />
                                                <h3>Write Prescription</h3>
                                                <div className="dd-rx-timestamp">
                                                    <Clock size={12} />
                                                    {new Date().toLocaleString('en-IN')}
                                                </div>
                                            </div>

                                            <div className="dd-form-group">
                                                <label>Reason for Visit *</label>
                                                <input type="text" placeholder="e.g. Routine check-up, Follow-up, Emergency"
                                                    value={rxForm.visitReason} onChange={e => setRxForm(f => ({ ...f, visitReason: e.target.value }))} />
                                            </div>

                                            <div className="dd-form-group">
                                                <label>Symptoms & Clinical Observations *</label>
                                                <textarea rows={3} placeholder="Describe patient symptoms, vitals, and clinical observations..."
                                                    value={rxForm.symptoms} onChange={e => setRxForm(f => ({ ...f, symptoms: e.target.value }))} />
                                            </div>

                                            <div className="dd-form-group">
                                                <label>Diagnosis *</label>
                                                <input type="text" placeholder="Primary diagnosis"
                                                    value={rxForm.diagnosis} onChange={e => setRxForm(f => ({ ...f, diagnosis: e.target.value }))} />
                                            </div>

                                            {/* Medications */}
                                            <div className="dd-form-group">
                                                <label>Medications</label>
                                                {rxForm.medications.map((med, i) => (
                                                    <div key={i} className="dd-med-row">
                                                        <div className="dd-med-num">{i + 1}</div>
                                                        <div className="dd-med-fields">
                                                            <input placeholder="Drug name" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} />
                                                            <input placeholder="Dose (e.g. 10mg)" value={med.dose} onChange={e => updateMed(i, 'dose', e.target.value)} />
                                                            <input placeholder="Frequency (e.g. Twice daily)" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} />
                                                            <input placeholder="Duration (e.g. 30 days)" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
                                                            <input placeholder="Special instructions" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} className="dd-med-full" />
                                                        </div>
                                                        {rxForm.medications.length > 1 && (
                                                            <button className="dd-med-remove" onClick={() => removeMed(i)}><Trash2 size={14} /></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button className="dd-add-med-btn" onClick={addMed}><Plus size={14} /> Add Medication</button>
                                            </div>

                                            <div className="dd-form-group">
                                                <label>Lab Tests Recommended <span className="dd-label-hint">(comma separated)</span></label>
                                                <input type="text" placeholder="e.g. CBC, Lipid Panel, ECG"
                                                    value={rxForm.labTests} onChange={e => setRxForm(f => ({ ...f, labTests: e.target.value }))} />
                                            </div>

                                            <div className="dd-form-group">
                                                <label>Follow-up Date</label>
                                                <input type="date" value={rxForm.followUp} onChange={e => setRxForm(f => ({ ...f, followUp: e.target.value }))} />
                                            </div>

                                            <div className="dd-form-group">
                                                <label>Doctor's Notes & Advice</label>
                                                <textarea rows={3} placeholder="Additional advice, lifestyle changes, warnings..."
                                                    value={rxForm.notes} onChange={e => setRxForm(f => ({ ...f, notes: e.target.value }))} />
                                            </div>

                                            <div className="dd-rx-form-actions">
                                                <button className="dd-save-rx-btn" onClick={handleSaveRx}>
                                                    <Save size={16} /> Save & Generate Prescription
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <RxPreview rx={rxSaved} doctor={user} patient={scannedPatient} printRef={printRef} onPrint={handlePrint} onNew={handleClearScan} />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PATIENTS ── */}
                    {activeTab === 'patients' && (
                        <div className="dd-tab">
                            <div className="dd-section-label flex justify-between items-center mb-4">
                                <span>Registered Patients ({filteredPatients.length})</span>
                                <div className="w-64"><SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search patients..." /></div>
                            </div>
                            <div className="dd-patients-list">
                                {filteredPatients.length === 0 && <EmptyState title="No patients found" description="Try a different search term" />}
                                {filteredPatients.map(p => (
                                    <div key={p.id} className="dd-patient-card">
                                        <div className="dd-pc-avatar">{p.name.charAt(0)}</div>
                                        <div className="dd-pc-info">
                                            <p className="dd-pc-name">{p.name}</p>
                                            <p className="dd-pc-meta">ID: {p.id} · {p.bloodGroup} · {p.gender}</p>
                                            {p.chronicConditions?.length > 0 && (
                                                <p className="dd-pc-conditions">{p.chronicConditions.join(', ')}</p>
                                            )}
                                        </div>
                                        <div className="dd-pc-right">
                                            {p.allergies?.length > 0 && (
                                                <span className="dd-allergy-chip"><AlertTriangle size={11} /> {p.allergies.length} allergy</span>
                                            )}
                                            <button className="dd-prescribe-btn" onClick={() => { handleSimulateScan(p.id); setActiveTab('scanner'); }}>
                                                <FileText size={13} /> Prescribe
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PRESCRIPTIONS ── */}
                    {activeTab === 'prescriptions' && (
                        <div className="dd-tab">
                            <div className="dd-section-label flex justify-between items-center mb-4">
                                <span>Prescriptions Issued ({filteredRx.length})</span>
                                <div className="w-64"><SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search prescriptions..." /></div>
                            </div>
                            <div className="dd-rx-list">
                                {filteredRx.length === 0 && <EmptyState title="No prescriptions found" description="Try a different search term" />}
                                {filteredRx.map(rx => (
                                    <div key={rx.id} className="dd-rx-card">
                                        <div className="dd-rx-icon"><FileText size={18} color="#7c3aed" /></div>
                                        <div className="dd-rx-info">
                                            <p className="dd-rx-title">{rx.patientName || rx.patientId} — {rx.diagnosis}</p>
                                            <p className="dd-rx-meta">{new Date(rx.issuedAt).toLocaleString('en-IN')}</p>
                                            <p className="dd-rx-meds">{rx.medications?.length} medication(s) · {rx.labTests?.length || 0} test(s)</p>
                                        </div>
                                        <div className="dd-rx-status-wrap">
                                            <span className={`dd-badge ${rx.status}`}>{rx.status}</span>
                                            {rx.status === 'active' && (
                                                <button className="dd-status-btn" onClick={() => handleUpdateStatus(rx.id, 'completed')} title="Mark as completed">
                                                    <CheckCircle size={13} /> Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PROFILE ── */}
                    {activeTab === 'profile' && (
                        <div className="dd-tab">
                            <div className="dd-profile-card">
                                <div className="dd-profile-top">
                                    <div className="dd-avatar-lg">{user?.name?.charAt(0) || 'D'}</div>
                                    <div>
                                        <h2>{user?.name}</h2>
                                        <p>{user?.email}</p>
                                        <span className="dd-role-chip">Doctor</span>
                                    </div>
                                </div>
                                <div className="dd-profile-grid">
                                    {[
                                        { label: 'Specialty', value: user?.specialty || 'Cardiology' },
                                        { label: 'License No.', value: user?.license || 'MD-2024-001' },
                                        { label: 'Hospital', value: user?.hospital || 'MediVault General Hospital' },
                                        { label: 'Phone', value: user?.phone || '+1 (555) 987-6543' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="dd-profile-row">
                                            <span className="dd-profile-label">{label}</span>
                                            <span className="dd-profile-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main >
        </div >
    );
}

// ─── Prescription Preview ─────────────────────────────────────────────────────
function RxPreview({ rx, doctor, patient, printRef, onPrint, onNew }) {
    if (!rx) return null;
    return (
        <div className="dd-rx-preview">
            <div className="dd-rx-preview-actions">
                <div className="dd-rx-saved-badge"><CheckCircle size={15} color="#10b981" /> Prescription saved to patient vault</div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="dd-print-btn" onClick={onPrint}><Printer size={15} /> Print</button>
                    <button className="dd-new-scan-btn" onClick={onNew}><QrCode size={15} /> New Scan</button>
                </div>
            </div>

            <div className="dd-rx-letter" ref={printRef}>
                {/* Letterhead */}
                <div className="rx-letterhead">
                    <div className="rx-lh-left">
                        <div className="rx-lh-logo"><img src="/logo.png" alt="MediVault" style={{ height: '36px', width: 'auto', marginRight: '8px' }} /><span>MediVault</span></div>
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

                <div className="rx-title-row">
                    <div>
                        <h2 className="rx-title">Medical Prescription</h2>
                        <p className="rx-id">Ref: {rx.id}</p>
                    </div>
                    <div className="rx-timestamp">
                        <Clock size={13} />
                        {new Date(rx.issuedAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                <div className="rx-patient-box">
                    <div className="rx-patient-row"><span className="rx-field-label">Patient Name</span><span className="rx-field-value">{patient?.name}</span></div>
                    <div className="rx-patient-row"><span className="rx-field-label">Patient ID</span><span className="rx-field-value">{patient?.id}</span></div>
                    <div className="rx-patient-row"><span className="rx-field-label">Visit Reason</span><span className="rx-field-value">{rx.visitReason}</span></div>
                </div>

                <div className="rx-section">
                    <h3 className="rx-section-title">Symptoms & Observations</h3>
                    <p className="rx-section-body">{rx.symptoms || '—'}</p>
                </div>
                <div className="rx-section">
                    <h3 className="rx-section-title">Diagnosis</h3>
                    <p className="rx-section-body rx-diagnosis">{rx.diagnosis}</p>
                </div>

                {rx.medications?.filter(m => m.name).length > 0 && (
                    <div className="rx-section">
                        <h3 className="rx-section-title">Prescribed Medications</h3>
                        <div className="rx-meds-list">
                            {rx.medications.filter(m => m.name).map((med, i) => (
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
                )}

                {rx.labTests?.length > 0 && (
                    <div className="rx-section">
                        <h3 className="rx-section-title">Recommended Tests</h3>
                        <div className="rx-tests-list">{rx.labTests.map((t, i) => <span key={i} className="rx-test-chip">{t}</span>)}</div>
                    </div>
                )}

                {rx.notes && (
                    <div className="rx-section">
                        <h3 className="rx-section-title">Doctor's Notes</h3>
                        <p className="rx-section-body rx-notes">{rx.notes}</p>
                    </div>
                )}

                {rx.followUp && (
                    <div className="rx-followup"><Calendar size={14} /><span>Follow-up: <strong>{rx.followUp}</strong></span></div>
                )}

                <div className="rx-signature">
                    <div className="rx-sig-line">
                        <p className="rx-sig-name">{rx.doctorName}</p>
                        <p className="rx-sig-label">Doctor's Signature</p>
                    </div>
                    <div className="rx-sig-stamp"><Shield size={14} /><span>Digitally verified by MediVault</span></div>
                </div>
                <div className="rx-footer">Ref: {rx.id} · {new Date(rx.issuedAt).toISOString()} · MediVault Digital Health Platform</div>
            </div>
        </div>
    );
}
