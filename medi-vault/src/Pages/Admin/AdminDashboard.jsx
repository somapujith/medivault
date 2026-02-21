import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useData } from '../../Context/DataContext';
import {
    LayoutDashboard, Users, Database, Settings, LogOut,
    Bell, ChevronRight, Clock, Shield, Activity,
    CheckCircle, AlertTriangle, FileText,
    Pill, TrendingUp, Server, Lock, Trash2, RefreshCw,
} from 'lucide-react';
import { useToast } from '../../Context/ToastContext';
import SearchInput from '../../Components/Common/SearchInput';
import EmptyState from '../../Components/Common/EmptyState';
import ThemeToggle from '../../Components/Common/ThemeToggle';
import ProfileDropdown from '../../Components/Common/ProfileDropdown';
import './AdminDashboard.css';
import './AdminDashboardMobile.css';

const NAV = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'System Settings', icon: Settings },
];

const INITIAL_SETTINGS = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send alerts for critical system events', on: true },
    { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', on: true },
    { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all user actions for compliance', on: true },
    { key: 'qrExpiry', label: 'QR Code Expiry (24h)', desc: 'Patient QR codes expire after 24 hours', on: true },
    { key: 'doctorVerification', label: 'Doctor Verification Required', desc: 'New doctors must be verified before access', on: true },
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily disable user access', on: false },
    { key: 'autoBackups', label: 'Auto Backups', desc: 'Daily automated database backups at 2 AM', on: true },
];

const roleColor = { patient: '#00d4ff', doctor: '#7c3aed', admin: '#059669', PATIENT: '#00d4ff', DOCTOR: '#7c3aed', ADMIN: '#059669' };
const logColor = { info: '#00d4ff', warning: '#f59e0b', success: '#10b981', error: '#ef4444' };

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const { getAllUsers, getSystemStats } = useData();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = NAV.some(n => n.id === tabParam) ? tabParam : 'overview';
    const setActiveTab = (tab) => setSearchParams({ tab });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userFilter, setUserFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [deletingId, setDeletingId] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, uid: null, uname: '' });

    // Data State
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ users: 0, patients: 0, prescriptions: 0, documents: 0 });

    // Dynamic activity log built from real actions
    const [activityLog, setActivityLog] = useState([
        { event: 'Admin logged in', user: user?.email || 'admin', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), type: 'info', detail: 'Session started' },
    ]);

    const addLog = useCallback((event, detail, type = 'info') => {
        setActivityLog(prev => [{
            event,
            user: user?.email || 'admin',
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            type,
            detail,
        }, ...prev].slice(0, 20));
    }, [user]);

    const loadData = useCallback(async () => {
        if (user?.role === 'admin') {
            setStatsLoading(true);
            try {
                const [uList, sData] = await Promise.all([
                    getAllUsers(),
                    getSystemStats().catch(() => null)
                ]);
                setUsers(uList || []);
                if (sData) setStats(sData);
            } catch (err) {
                console.error("Admin data load error", err);
            } finally {
                setStatsLoading(false);
            }
        }
    }, [user, getAllUsers, getSystemStats]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleLogout = () => { logout(); navigate('/', { replace: true }); };

    const handleDeleteUser = async (uid, uname) => {
        setDeleteModal({ show: true, uid, uname });
    };

    const confirmDelete = async () => {
        const { uid, uname } = deleteModal;
        setDeleteModal({ show: false, uid: null, uname: '' });
        setDeletingId(uid);
        try {
            await fetch(`/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('medivault_user'))?.token}` }
            });
            setUsers(prev => prev.filter(u => u.id !== uid));
            addLog(`User deleted`, uname, 'warning');
            success('User deleted successfully');
        } catch (err) {
            error('Failed to delete user.');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleSetting = (key) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, on: !s.on } : s));
        const s = settings.find(x => x.key === key);
        addLog(`Setting toggled: ${s?.label}`, s?.on ? 'Disabled' : 'Enabled', 'info');
    };

    const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
        const matchesRole = userFilter === 'all' || (u.role || '').toLowerCase() === userFilter;
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id?.toString().includes(searchTerm);
        return matchesRole && matchesSearch;
    });

    return (
        <div className="ad-layout">
            {sidebarOpen && <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />}

            <aside className={`ad-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="ad-sidebar-brand">
                    <img src="/logo.png" alt="MediVault" style={{ height: '32px', width: 'auto' }} />
                    <span style={{ marginLeft: '8px' }}>MediVault</span>
                </div>
                <div className="ad-sidebar-user">
                    <div className="ad-avatar-sm">{user?.name?.charAt(0)}</div>
                    <div>
                        <p className="ad-user-name">{user?.name}</p>
                        <p className="ad-user-role">Administrator</p>
                    </div>
                </div>
                <nav className="ad-nav">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button key={id} className={`ad-nav-btn ${activeTab === id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(id); setSidebarOpen(false); }} id={`admin-nav-${id}`}>
                            <Icon size={17} /><span>{label}</span>
                            {activeTab === id && <ChevronRight size={13} className="ad-nav-arrow" />}
                        </button>
                    ))}
                </nav>
                <button className="ad-logout-btn" onClick={handleLogout} id="admin-logout">
                    <LogOut size={17} /><span>Sign Out</span>
                </button>
            </aside>

            <main className="ad-main">
                <header className="ad-topbar">
                    <button className="ad-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menu">
                        <span /><span /><span />
                    </button>
                    <h1 className="ad-topbar-title">{NAV.find(n => n.id === activeTab)?.label}</h1>
                    <div className="ad-topbar-right">
                        <ThemeToggle />
                        <button className="ad-icon-btn" aria-label="Refresh" onClick={loadData} title="Refresh data">
                            <RefreshCw size={16} className={statsLoading ? 'ad-spin' : ''} />
                        </button>
                        <ProfileDropdown user={user} role="admin" />
                    </div>
                </header>

                <div className="ad-content">

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <div className="ad-tab">
                            <div className="ad-welcome">
                                <div>
                                    <h2>Admin Control Center 🛡️</h2>
                                    <p>All systems operational · MediVault v2.0</p>
                                </div>
                                <div className="ad-welcome-date"><Clock size={13} />
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="ad-stats-row">
                                {[
                                    { label: 'Total Users', value: stats.users || users.length, icon: Users, color: '#00d4ff' },
                                    { label: 'Registered Patients', value: stats.patients || 0, icon: Activity, color: '#7c3aed' },
                                    { label: 'Prescriptions', value: stats.prescriptions || 0, icon: Pill, color: '#10b981' },
                                    { label: 'Documents', value: stats.documents || 0, icon: FileText, color: '#f59e0b' },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="ad-stat-card">
                                        <div className="ad-stat-icon" style={{ color }}><Icon size={20} /></div>
                                        <div>
                                            <p className="ad-stat-value" style={{ color }}>{statsLoading ? '…' : value}</p>
                                            <p className="ad-stat-label">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* System health */}
                            <div className="ad-section-label">System Health</div>
                            <div className="ad-health-grid">
                                {[
                                    { label: 'API Server', status: 'Operational', uptime: '99.98%', icon: Server, color: '#10b981' },
                                    { label: 'Database', status: 'Operational', uptime: '99.99%', icon: Database, color: '#10b981' },
                                    { label: 'Auth Service', status: 'Operational', uptime: '100%', icon: Lock, color: '#10b981' },
                                    { label: 'QR Service', status: settings.find(s => s.key === 'maintenanceMode')?.on ? 'Maintenance' : 'Operational', uptime: '99.95%', icon: TrendingUp, color: settings.find(s => s.key === 'maintenanceMode')?.on ? '#f59e0b' : '#10b981' },
                                ].map(s => (
                                    <div key={s.label} className="ad-health-card">
                                        <div className="ad-health-icon" style={{ color: s.color }}><s.icon size={18} /></div>
                                        <div>
                                            <p className="ad-health-label">{s.label}</p>
                                            <p className="ad-health-status" style={{ color: s.color }}>{s.status}</p>
                                        </div>
                                        <span className="ad-uptime">{s.uptime}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="ad-section-label">Recent Activity</div>
                            <div className="ad-logs-list">
                                {activityLog.length === 0 && <div className="ad-empty">No activity recorded yet.</div>}
                                {activityLog.slice(0, 8).map((log, i) => (
                                    <div key={i} className="ad-log-entry">
                                        <div className="ad-log-dot" style={{ background: logColor[log.type] }} />
                                        <div className="ad-log-info">
                                            <span className="ad-log-event">{log.event}</span>
                                            <span className="ad-log-user">{log.user} · {log.detail}</span>
                                        </div>
                                        <span className="ad-log-time">{log.time}</span>
                                        <span className="ad-log-badge" style={{ color: logColor[log.type], background: `${logColor[log.type]}18` }}>{log.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── USERS ── */}
                    {activeTab === 'users' && (
                        <div className="ad-tab">
                            <div className="ad-users-header flex flex-col gap-4 mb-4">
                                <div className="flex justify-between items-center w-full">
                                    <div className="ad-section-label" style={{ margin: 0 }}>All Users ({filteredUsers.length})</div>
                                    <div className="ad-filter-tabs">
                                        {['all', 'patient', 'doctor', 'admin'].map(f => (
                                            <button key={f} className={`ad-filter-btn ${userFilter === f ? 'active' : ''}`}
                                                onClick={() => setUserFilter(f)}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search users by name, email or ID..." />
                            </div>
                            <div className="ad-users-list">
                                {filteredUsers.length === 0 && <EmptyState title="No users found" description="Try adjusting your filters or search" />}
                                {filteredUsers.map(u => (
                                    <div key={u.id} className="ad-user-row">
                                        <div className="ad-user-avatar" style={{ background: `${roleColor[u.role] || '#888'}22`, color: roleColor[u.role] || '#888' }}>
                                            {u.name?.charAt(0)}
                                        </div>
                                        <div className="ad-user-info">
                                            <p className="ad-user-name-text">{u.name}</p>
                                            <p className="ad-user-email">{u.email}</p>
                                        </div>
                                        <span className="ad-role-chip" style={{ color: roleColor[u.role] || '#888', background: `${roleColor[u.role] || '#888'}18` }}>{(u.role || '').toLowerCase()}</span>
                                        <div className="ad-user-dates">
                                            <span>ID: {u.id}</span>
                                        </div>
                                        <span className="ad-status-chip" style={{ color: '#10b981', background: '#10b98118' }}>
                                            <CheckCircle size={11} /> Active
                                        </span>
                                        {u.email !== user?.email && (
                                            <button
                                                className="ad-delete-btn"
                                                onClick={() => handleDeleteUser(u.id, u.name)}
                                                disabled={deletingId === u.id}
                                                title="Delete user"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── SETTINGS ── */}
                    {activeTab === 'settings' && (
                        <div className="ad-tab">
                            <div className="ad-settings-card">
                                <h3>System Configuration</h3>
                                <div className="ad-settings-list">
                                    {settings.map((s) => (
                                        <div key={s.key} className="ad-setting-row" onClick={() => toggleSetting(s.key)} style={{ cursor: 'pointer' }}>
                                            <div>
                                                <p className="ad-setting-label">{s.label}</p>
                                                <p className="ad-setting-desc">{s.desc}</p>
                                            </div>
                                            <div className={`ad-toggle ${s.on ? 'on' : ''}`} role="switch" aria-checked={s.on}>
                                                <div className="ad-toggle-thumb" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="ad-settings-save">
                                    <button className="ad-save-btn" onClick={() => { addLog('Settings saved', `${settings.filter(s => s.on).length} features enabled`, 'success'); success('Settings saved!'); }}>
                                        <CheckCircle size={15} /> Save Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Delete Confirm Modal */}
            {deleteModal.show && (
                <div className="ad-modal-overlay" onClick={() => setDeleteModal({ show: false, uid: null, uname: '' })}>
                    <div className="ad-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="ad-confirm-icon"><Trash2 size={28} color="#ef4444" /></div>
                        <h3>Delete User?</h3>
                        <p>Are you sure you want to delete <strong>{deleteModal.uname}</strong>? This action cannot be undone.</p>
                        <div className="ad-confirm-actions">
                            <button className="ad-confirm-cancel" onClick={() => setDeleteModal({ show: false, uid: null, uname: '' })}>Cancel</button>
                            <button className="ad-confirm-delete" onClick={confirmDelete}>Delete User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}