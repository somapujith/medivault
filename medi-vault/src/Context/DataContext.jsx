import { createContext, useContext, useState, useCallback } from 'react';
import { patientApi, prescriptionApi, documentApi, adminApi } from '../Api/ApiClient';

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const [scannedPatient, setScannedPatientState] = useState(() => {
        try {
            const saved = sessionStorage.getItem('medivault_scanned_patient');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const setScannedPatient = useCallback((patient) => {
        setScannedPatientState(patient);
        if (patient) {
            sessionStorage.setItem('medivault_scanned_patient', JSON.stringify(patient));
        } else {
            sessionStorage.removeItem('medivault_scanned_patient');
        }
    }, []);

    // ── Patient helpers ──────────────────────────────────────────────────────
    const getPatientById = useCallback(async (id) => {
        return await patientApi.getById(id);
    }, []);

    const getAllPatients = useCallback(async () => {
        return await patientApi.getAll();
    }, []);

    const getPatientByUserId = useCallback(async (userId) => {
        return await patientApi.getByUserId(userId);
    }, []);

    // ── QR scan session ──────────────────────────────────────────────────────
    const startScanSession = useCallback(async (patientId) => {
        try {
            const patient = await patientApi.getByQr(patientId);
            setScannedPatient(patient);
            return patient;
        } catch (err) {
            setScannedPatient(null);
            throw err;
        }
    }, []);

    const clearScanSession = useCallback(() => setScannedPatient(null), []);

    // ── Prescription helpers ─────────────────────────────────────────────────
    const getPrescriptionsForPatient = useCallback(async (patientId) => {
        return await prescriptionApi.getForPatient(patientId);
    }, []);

    const getPrescriptionsByDoctor = useCallback(async (doctorId) => {
        return await prescriptionApi.getByDoctor(doctorId);
    }, []);

    const addPrescription = useCallback(async (rxData) => {
        return await prescriptionApi.create(rxData);
    }, []);

    // ── Document helpers ─────────────────────────────────────────────────────
    const getDocumentsForPatient = useCallback(async (patientId) => {
        return await documentApi.getForPatient(patientId);
    }, []);

    const addDocument = useCallback(async (docData) => {
        return await documentApi.add(docData);
    }, []);

    // ── Admin helpers ────────────────────────────────────────────────────────
    const getAllUsers = useCallback(async () => {
        return await adminApi.getUsers();
    }, []);

    const getSystemStats = useCallback(async () => {
        return await adminApi.getStats();
    }, []);

    return (
        <DataContext.Provider value={{
            scannedPatient,
            getPatientById,
            getAllPatients,
            getPrescriptionsForPatient,
            getPrescriptionsByDoctor,
            addPrescription,
            getDocumentsForPatient,
            addDocument,
            getSystemStats,
            getAllUsers,
            getPatientByUserId,
            startScanSession,
            clearScanSession,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within a DataProvider');
    return ctx;
}

export default DataContext;
