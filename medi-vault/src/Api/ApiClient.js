// Use environment variable for production, fallback to proxy for dev
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// ── Helper ────────────────────────────────────────────────────────────────────
async function request(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
}

const getToken = () => {
    try { return JSON.parse(localStorage.getItem('medivault_user'))?.token || null; }
    catch { return null; }
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (email, password) =>
        request('POST', '/auth/login', { email, password }),

    register: (data) =>
        request('POST', '/auth/register', data),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
    getAll: () =>
        request('GET', '/patient/all', null, getToken()),

    getById: (id) =>
        request('GET', `/patient/${id}`, null, getToken()),

    getByQr: (patientId) =>
        request('GET', `/patient/qr/${patientId}`, null, getToken()),

    getByUserId: (userId) =>
        request('GET', `/patient/user/${userId}`, null, getToken()),
};

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const prescriptionApi = {
    create: (data) =>
        request('POST', '/prescriptions', data, getToken()),

    getForPatient: (patientId) =>
        request('GET', `/prescriptions/patient/${patientId}`, null, getToken()),

    getByDoctor: (doctorId) =>
        request('GET', `/prescriptions/doctor/${doctorId}`, null, getToken()),

    getById: (id) =>
        request('GET', `/prescriptions/${id}`, null, getToken()),

    updateStatus: (id, status) =>
        request('PATCH', `/prescriptions/${id}/status`, { status }, getToken()),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentApi = {
    create: (data) =>
        request('POST', '/appointments', data, getToken()),

    getForPatient: (patientId) =>
        request('GET', `/appointments/patient/${patientId}`, null, getToken()),

    getForDoctor: (doctorId) =>
        request('GET', `/appointments/doctor/${doctorId}`, null, getToken()),

    updateStatus: (id, status) =>
        request('PATCH', `/appointments/${id}/status`, { status }, getToken()),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentApi = {
    getForPatient: (patientId) =>
        request('GET', `/documents/patient/${patientId}`, null, getToken()),

    add: (data) =>
        request('POST', '/documents', data, getToken()),

    delete: (id) =>
        request('DELETE', `/documents/${id}`, null, getToken()),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
    getUsers: () =>
        request('GET', '/admin/users', null, getToken()),

    deleteUser: (id) =>
        request('DELETE', `/admin/users/${id}`, null, getToken()),

    getStats: () =>
        request('GET', '/admin/stats', null, getToken()),
};
