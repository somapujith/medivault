// src/Components/Common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoggedIn, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    borderTopColor: '#00d4ff',
                    animation: 'spin 1s ease-in-out infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

export default ProtectedRoute;
