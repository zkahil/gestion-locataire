// src/components/Layout.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);

    const newsItems = [
        { icon: 'fa-star', text: 'Nouvelle version 2.0 disponible', color: '#f59e0b' },
        { icon: 'fa-gift', text: 'Promotion : 10% de réduction sur les nouveaux contrats', color: '#10b981' },
        { icon: 'fa-calendar', text: 'Mise à jour des règlements intérieurs', color: '#3b82f6' },
        { icon: 'fa-chart-line', text: 'Taux d\'occupation en hausse de 15% ce mois-ci', color: '#8b5cf6' },
        { icon: 'fa-bell', text: 'Nouvelle fonctionnalité : Export PDF des rapports', color: '#1a5f7a' },
    ];

    // Définition des routes par rôle
    const allRoutes = [
        { name: 'Dashboard', path: '/', icon: 'fa-chart-pie', roles: ['admin', 'gestionnaire', 'comptable', 'consultation'] },
        { name: 'Espaces', path: '/espaces', icon: 'fa-door-open', roles: ['admin', 'gestionnaire', 'comptable', 'consultation'] },
        { name: 'Locataires', path: '/locataires', icon: 'fa-users', roles: ['admin', 'gestionnaire', 'comptable', 'consultation'] },
        { name: 'Contrats', path: '/contrats', icon: 'fa-file-signature', roles: ['admin', 'gestionnaire'] },
        { name: 'Factures', path: '/factures', icon: 'fa-receipt', roles: ['admin', 'gestionnaire', 'comptable'] },
        { name: 'Paiements', path: '/paiements', icon: 'fa-hand-holding-usd', roles: ['admin', 'comptable'] },
        { name: 'Cautions', path: '/cautions', icon: 'fa-shield-alt', roles: ['admin', 'gestionnaire'] },
        { name: 'Reglement', path: '/reglement', icon: 'fa-gavel', roles: ['admin', 'gestionnaire', 'comptable', 'consultation'] },
        { name: 'Alertes', path: '/alertes', icon: 'fa-bell', roles: ['admin', 'gestionnaire', 'comptable', 'consultation'] },
        { name: 'Utilisateurs', path: '/utilisateurs', icon: 'fa-user-cog', roles: ['admin'] },
        { name: 'Journal', path: '/journal', icon: 'fa-history', roles: ['admin'] },
    ];

    // Filtrer les routes selon le rôle
    const nav = allRoutes.filter(item => 
        item.roles.includes(user?.role || 'consultation')
    );

    // Ajouter les séparateurs
    const navWithDividers = [];
    nav.forEach((item, index) => {
        if (index > 0 && nav[index - 1].path === '/contrats' && item.path === '/factures') {
            navWithDividers.push({ divider: true });
        }
        if (index > 0 && nav[index - 1].path === '/cautions' && item.path === '/reglement') {
            navWithDividers.push({ divider: true });
        }
        navWithDividers.push(item);
    });

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 10000);
        const newsInterval = setInterval(() => {
            setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
        }, 5000);
        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
            clearInterval(newsInterval);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await api.get('/alertes');
            const data = res.data.data || [];
            setNotifications(data.slice(0, 10));
            setUnreadCount(data.filter(a => a.lu === 0 || a.lu === false).length);
        } catch (error) {
            console.error('Erreur chargement notifications');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/alertes/${id}/read`);
            loadNotifications();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/alertes/read-all');
            loadNotifications();
            toast.success('Toutes les notifications marquées comme lues');
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNotificationIcon = (type) => {
        const icons = {
            echeance: 'fa-clock',
            impaye: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            contrat: 'fa-file-signature',
            resiliation: 'fa-times-circle',
            paiement: 'fa-check-circle',
            validation: 'fa-check-circle'
        };
        return icons[type] || 'fa-bell';
    };

    const getNotificationColor = (type) => {
        const colors = {
            echeance: '#f59e0b',
            impaye: '#ef4444',
            info: '#3b82f6',
            contrat: '#8b5cf6',
            resiliation: '#ef4444',
            paiement: '#16a34a',
            validation: '#16a34a'
        };
        return colors[type] || '#94a3b8';
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.length > 2) {
            const results = nav.filter(item => 
                item.name && item.name.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(results);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'Administrateur',
            gestionnaire: 'Gestionnaire',
            comptable: 'Comptable',
            consultation: 'Consultation'
        };
        return labels[role] || role;
    };

    return (
        <div className="app" style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            {/* Header fixe avec info scroll */}
            <header style={{ 
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0'
            }}>
                {/* Top bar avec logo et actions */}
                <div className="topbar" style={{ 
                    padding: '0 1.5rem', 
                    height: '56px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: '#ffffff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{ 
                                display: 'none',
                                background: 'transparent', 
                                border: 'none', 
                                fontSize: '1.3rem', 
                                cursor: 'pointer',
                                color: '#1a5f7a'
                            }}
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className="logo" style={{ fontWeight: '700', fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-building" style={{ color: '#1a5f7a', fontSize: '1.3rem' }}></i> 
                            <span>GestionLoc</span>
                            <span style={{ fontSize: '0.55rem', background: '#1a5f7a', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>v2.0</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Search */}
                        <div ref={searchRef} style={{ position: 'relative' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#f1f5f9',
                                borderRadius: '8px',
                                padding: '4px 12px',
                                transition: 'all 0.3s ease',
                                border: showSearch ? '2px solid #1a5f7a' : '2px solid transparent'
                            }}>
                                <i className="fas fa-search" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                                <input 
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => setShowSearch(true)}
                                    onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '6px 8px',
                                        fontSize: '0.78rem',
                                        width: showSearch ? '180px' : '120px',
                                        transition: 'width 0.3s ease',
                                        outline: 'none',
                                        color: '#1e293b'
                                    }}
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                            {showSearchResults && searchResults.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    border: '1px solid #e2e8f0',
                                    marginTop: '4px',
                                    overflow: 'hidden',
                                    zIndex: 1000
                                }}>
                                    {searchResults.map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '8px 12px',
                                                color: '#1e293b',
                                                textDecoration: 'none',
                                                fontSize: '0.78rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                                        >
                                            <i className={`fas ${item.icon}`} style={{ color: '#1a5f7a', width: '18px' }}></i>
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <div ref={notificationRef} style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    fontSize: '1.1rem', 
                                    cursor: 'pointer',
                                    position: 'relative',
                                    color: '#64748b',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <i className="fas fa-bell"></i>
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '4px',
                                        background: '#ef4444',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        fontSize: '0.55rem',
                                        padding: '2px 6px',
                                        minWidth: '18px',
                                        textAlign: 'center'
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '380px',
                                    maxHeight: '420px',
                                    background: '#fff',
                                    borderRadius: '10px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    zIndex: 1000,
                                    marginTop: '4px'
                                }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                            <i className="fas fa-bell" style={{ marginRight: '8px' }}></i>
                                            Notifications
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllAsRead}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#1a5f7a',
                                                        fontSize: '0.7rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Tout marquer lu
                                                </button>
                                            )}
                                            <Link 
                                                to="/alertes" 
                                                style={{ 
                                                    color: '#1a5f7a', 
                                                    textDecoration: 'none', 
                                                    fontSize: '0.7rem',
                                                    fontWeight: '500'
                                                }}
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Voir tout
                                            </Link>
                                        </div>
                                    </div>
                                    <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                                <i className="fas fa-check-circle" style={{ fontSize: '32px', color: '#16a34a', display: 'block', marginBottom: '8px' }}></i>
                                                Aucune notification
                                            </div>
                                        ) : (
                                            notifications.map(notif => {
                                                const isUnread = notif.lu === 0 || notif.lu === false;
                                                const icon = getNotificationIcon(notif.type);
                                                const color = getNotificationColor(notif.type);
                                                return (
                                                    <div 
                                                        key={notif.id}
                                                        style={{
                                                            padding: '10px 16px',
                                                            borderBottom: '1px solid #f1f5f9',
                                                            background: isUnread ? '#f0f9ff' : '#fff',
                                                            borderLeft: isUnread ? `4px solid ${color}` : '4px solid transparent',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? '#f0f9ff' : '#fff'}
                                                        onClick={() => {
                                                            if (isUnread) markAsRead(notif.id);
                                                            navigate('/alertes');
                                                            setShowNotifications(false);
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                            <i className={`fas ${icon}`} style={{ color: color, fontSize: '16px', marginTop: '2px' }}></i>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: isUnread ? '600' : '400' }}>
                                                                    {notif.message}
                                                                </div>
                                                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>
                                                                    {notif.date || new Date().toLocaleDateString('fr-FR')}
                                                                    {isUnread && (
                                                                        <span style={{ marginLeft: '8px', background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '8px' }}>
                                                                            Nouveau
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isUnread && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: '#94a3b8',
                                                                        cursor: 'pointer',
                                                                        fontSize: '11px'
                                                                    }}
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Menu utilisateur */}
                        <div ref={userMenuRef} style={{ position: 'relative' }}>
                            <div 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #1a5f7a, #2d8ba8)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '0.8rem'
                                }}>
                                    {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div style={{ display: 'none', '@media(min-width: 768px)': { display: 'flex' } }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: '500', color: '#1e293b', marginRight: '4px' }}>
                                        {user?.nom || 'Utilisateur'}
                                    </span>
                                    <i className="fas fa-chevron-down" style={{ fontSize: '0.5rem', color: '#94a3b8' }}></i>
                                </div>
                            </div>

                            {showUserMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '240px',
                                    background: '#fff',
                                    borderRadius: '10px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    border: '1px solid #e2e8f0',
                                    overflow: 'hidden',
                                    zIndex: 1000,
                                    marginTop: '4px'
                                }}>
                                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #1a5f7a, #2d8ba8)',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '600',
                                                fontSize: '1rem'
                                            }}>
                                                {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user?.nom || 'Utilisateur'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user?.email || ''}</div>
                                                <div style={{ 
                                                    fontSize: '0.6rem', 
                                                    background: '#dbeafe', 
                                                    color: '#1e40af', 
                                                    padding: '1px 8px', 
                                                    borderRadius: '10px',
                                                    display: 'inline-block',
                                                    marginTop: '2px'
                                                }}>
                                                    {getRoleLabel(user?.role)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '8px 0' }}>
                                        <Link 
                                            to="/profile" 
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '8px 16px',
                                                color: '#334155',
                                                textDecoration: 'none',
                                                fontSize: '0.82rem',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <i className="fas fa-user" style={{ width: '18px', color: '#64748b' }}></i>
                                            Mon profil
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link 
                                                to="/settings" 
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '8px 16px',
                                                    color: '#334155',
                                                    textDecoration: 'none',
                                                    fontSize: '0.82rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <i className="fas fa-cog" style={{ width: '18px', color: '#64748b' }}></i>
                                                Paramètres
                                            </Link>
                                        )}
                                        <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 12px' }}></div>
                                        <button 
                                            onClick={() => { setShowUserMenu(false); handleLogout(); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '8px 16px',
                                                width: '100%',
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#ef4444',
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <i className="fas fa-sign-out-alt" style={{ width: '18px' }}></i>
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barre d'info scrollable avec news */}
                <div style={{
                    background: 'linear-gradient(135deg, #1a5f7a, #0f3b5e)',
                    padding: '6px 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flex: 1,
                        overflow: 'hidden',
                        minWidth: 0
                    }}>
                        <span style={{
                            background: 'rgba(255,255,255,0.15)',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            color: '#ffd700',
                            fontSize: '0.6rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}>
                            <i className="fas fa-bolt" style={{ marginRight: '4px' }}></i>
                            NEWS
                        </span>
                        <div style={{
                            flex: 1,
                            overflow: 'hidden',
                            position: 'relative',
                            height: '24px'
                        }}>
                            {newsItems.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        transform: `translateY(${index === currentNewsIndex ? '0' : '100%'})`,
                                        opacity: index === currentNewsIndex ? 1 : 0,
                                        transition: 'all 0.5s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        height: '100%'
                                    }}
                                >
                                    <i className={`fas ${item.icon}`} style={{ color: item.color, fontSize: '0.8rem' }}></i>
                                    <span style={{
                                        color: '#fff',
                                        fontSize: '0.78rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexShrink: 0,
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.7rem'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fas fa-calendar-alt"></i>
                            {formatDate(currentTime)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fas fa-clock"></i>
                            {formatTime(currentTime)}
                        </span>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px'
                        }}>
                            <i className="fas fa-circle" style={{ color: '#22c55e', fontSize: '0.5rem' }}></i>
                            En ligne
                        </span>
                    </div>
                </div>
            </header>

            <div className="body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <nav className="sidebar" style={{ 
                    width: mobileMenuOpen ? '240px' : '210px',
                    background: '#ffffff', 
                    borderRight: '1px solid #e2e8f0', 
                    padding: '0.75rem 0', 
                    flexShrink: 0, 
                    overflowY: 'auto',
                    transition: 'width 0.3s ease',
                    zIndex: 50
                }}>
                    {navWithDividers.map((item, index) => {
                        if (item.divider) {
                            return <div key={`divider-${index}`} className="nav-divider" style={{ height: '1px', background: '#e2e8f0', margin: '0.4rem 1rem' }}></div>;
                        }
                        return (
                            <Link 
                                key={item.path}
                                to={item.path} 
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    padding: '0.6rem 1.2rem', 
                                    color: location.pathname === item.path ? '#1a5f7a' : '#64748b', 
                                    textDecoration: 'none', 
                                    fontSize: '0.82rem', 
                                    fontWeight: '500', 
                                    cursor: 'pointer', 
                                    borderLeft: location.pathname === item.path ? '3px solid #1a5f7a' : '3px solid transparent',
                                    background: location.pathname === item.path ? '#eff6ff' : 'transparent',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== item.path) {
                                        e.currentTarget.style.background = '#f8fafc';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== item.path) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <i className={`fas ${item.icon}`} style={{ width: '20px', textAlign: 'center', fontSize: '0.95rem' }}></i>
                                <span>{item.name}</span>
                                {item.name === 'Alertes' && unreadCount > 0 && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: '#ef4444',
                                        color: '#fff',
                                        borderRadius: '50%',
                                        fontSize: '0.6rem',
                                        padding: '1px 6px',
                                        minWidth: '18px',
                                        textAlign: 'center'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="main-content" style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: '#f8fafc' }}>
                    {children}
                </div>
            </div>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        zIndex: 40,
                        display: 'none'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <style>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .sidebar {
                        position: fixed !important;
                        top: 0;
                        left: ${mobileMenuOpen ? '0' : '-240px'};
                        width: 240px !important;
                        height: 100vh;
                        transition: left 0.3s ease;
                        z-index: 50;
                        box-shadow: ${mobileMenuOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'};
                        padding-top: 70px !important;
                    }
                    .sidebar .nav-item span {
                        display: inline !important;
                    }
                    .main-content {
                        padding: 0.75rem !important;
                    }
                }
                @media (max-width: 600px) {
                    .topbar {
                        padding: 0 0.75rem !important;
                        height: 50px !important;
                    }
                    .topbar .logo span {
                        font-size: 0.85rem;
                    }
                    .topbar .user .badge {
                        display: none;
                    }
                    .sidebar .nav-item {
                        padding: 0.5rem 1rem !important;
                    }
                    .topbar input[type="text"] {
                        width: 80px !important;
                    }
                    .topbar input[type="text"]:focus {
                        width: 120px !important;
                    }
                }
            `}</style>
        </div>
    );
};
export default Layout;