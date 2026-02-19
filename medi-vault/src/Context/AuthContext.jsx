import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../Api/ApiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('medivault_user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setIsLoggedIn(true);
            }
        } catch {
            localStorage.removeItem('medivault_user');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Login via Spring Boot /api/auth/login
     * Returns JWT token + user info from backend
     */
    const login = async (email, password) => {
        try {
            const data = await authApi.login(email, password);
            // data = { token, id, name, email, role, specialty, license, hospital, phone }
            const safeUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role.toLowerCase(), // 'patient' | 'doctor' | 'admin'
                token: data.token,
                specialty: data.specialty,
                license: data.license,
                hospital: data.hospital,
                phone: data.phone,
            };
            setUser(safeUser);
            setIsLoggedIn(true);
            localStorage.setItem('medivault_user', JSON.stringify(safeUser));
            return { success: true, user: safeUser };
        } catch (err) {
            return { success: false, error: err.message || 'Invalid email or password.' };
        }
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('medivault_user');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('medivault_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}

export default AuthContext;
