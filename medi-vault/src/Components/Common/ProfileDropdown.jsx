import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, Shield, ChevronDown } from 'lucide-react';
import './ProfileDropdown.css';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ user, role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : (role ? role.charAt(0).toUpperCase() : 'U');
    };

    const getRoleColor = (r) => {
        switch (r?.toLowerCase()) {
            case 'doctor': return 'linear-gradient(135deg, #6d28d9, #4f46e5)';
            case 'admin': return 'linear-gradient(135deg, #059669, #047857)';
            case 'patient': return 'linear-gradient(135deg, #0ea5e9, #0284c7)';
            default: return 'linear-gradient(135deg, #64748b, #475569)';
        }
    };

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button
                className="profile-trigger-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
                aria-expanded={isOpen}
            >
                <div
                    className="profile-avatar-sm"
                    style={{ background: getRoleColor(role) }}
                >
                    {getInitials(user?.name)}
                </div>
                <ChevronDown size={14} className={`profile-chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="profile-menu">
                    <div className="profile-header">
                        <div
                            className="profile-avatar-md"
                            style={{ background: getRoleColor(role) }}
                        >
                            {getInitials(user?.name)}
                        </div>
                        <div className="profile-info">
                            <p className="profile-name">{user?.name || 'User'}</p>
                            <p className="profile-email">{user?.email || `${role}@medivault.com`}</p>
                            <span className="profile-role-badge">{role}</span>
                        </div>
                    </div>

                    <div className="profile-divider" />

                    <button className="profile-item" onClick={() => setIsOpen(false)}>
                        <User size={16} /> My Profile
                    </button>
                    <button className="profile-item" onClick={() => setIsOpen(false)}>
                        <Settings size={16} /> Settings
                    </button>
                    {role === 'admin' && (
                        <button className="profile-item" onClick={() => setIsOpen(false)}>
                            <Shield size={16} /> Security
                        </button>
                    )}

                    <div className="profile-divider" />

                    <button className="profile-item danger" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
