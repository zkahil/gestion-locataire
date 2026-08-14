// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour recentrer la carte
function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || 13);
        }
    }, [center, zoom, map]);
    return null;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        sites: 0,
        espaces: 0,
        locataires: 0,
        contrats: 0,
        actifs: 0,
        disponibles: 0,
        impayes: 0
    });
    const [sites, setSites] = useState([]);
    const [espaces, setEspaces] = useState([]);
    const [etages, setEtages] = useState([]);
    const [recentContrats, setRecentContrats] = useState([]);
    const [mapCenter, setMapCenter] = useState([33.5731, -7.5898]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [hoveredSite, setHoveredSite] = useState(null);
    
    // ===== ÉTAT DES ALERTES =====
    const [alertes, setAlertes] = useState([]);
    const [alertesNonLues, setAlertesNonLues] = useState(0);
    const [alertesLoading, setAlertesLoading] = useState(true);

    useEffect(() => {
        loadData();
        loadAlertes();
    }, []);

    const loadData = async () => {
        try {
            const [sitesRes, espacesRes, etagesRes, locatairesRes, contratsRes, facturesRes] = await Promise.all([
                api.get('/api/sites'),
                api.get('/api/espaces'),
                api.get('/api/etages'),
                api.get('/api/locataires'),
                api.get('/api/contrats'),
                api.get('/api/factures')
            ]);
            
            const sitesData = sitesRes.data.data || [];
            const espacesData = espacesRes.data.data || [];
            const etagesData = etagesRes.data.data || [];
            const contratsData = contratsRes.data.data || [];
            const facturesData = facturesRes.data.data || [];
            
            setSites(sitesData);
            setEspaces(espacesData);
            setEtages(etagesData);
            
            if (sitesData.length > 0 && sitesData[0].latitude && sitesData[0].longitude) {
                setMapCenter([sitesData[0].latitude, sitesData[0].longitude]);
            }
            
            setStats({
                sites: sitesData.length,
                espaces: espacesData.length,
                locataires: locatairesRes.data.data?.length || 0,
                contrats: contratsData.length,
                actifs: contratsData.filter(c => c.statut === 'actif').length,
                disponibles: espacesData.filter(e => e.statut === 'disponible').length,
                impayes: facturesData.filter(f => f.statut === 'impayee').length
            });
            
            setRecentContrats(contratsData.slice(-5).reverse());
        } catch (error) {
            toast.error('Erreur de chargement');
            console.error(error);
        }
        setLoading(false);
    };

    // ===== CHARGEMENT DES ALERTES =====
    const loadAlertes = async () => {
        try {
            const res = await api.get('/api/alertes');
            const data = res.data.data || [];
            setAlertes(data);
            setAlertesNonLues(data.filter(a => a.lu === 0).length);
        } catch (error) {
            console.error('Erreur chargement alertes:', error);
        }
        setAlertesLoading(false);
    };

    // ===== MARQUER UNE ALERTE COMME LUE =====
    const markAlerteAsRead = async (id) => {
        try {
            await api.put(`/api/alertes/${id}/read`);
            const updated = alertes.map(a => 
                a.id === id ? { ...a, lu: 1 } : a
            );
            setAlertes(updated);
            setAlertesNonLues(updated.filter(a => a.lu === 0).length);
        } catch (error) {
            toast.error('Erreur lors du marquage');
        }
    };

    // ===== MARQUER TOUTES LES ALERTES COMME LUES =====
    const markAllAlertesAsRead = async () => {
        try {
            await api.put('/api/alertes/read-all');
            const updated = alertes.map(a => ({ ...a, lu: 1 }));
            setAlertes(updated);
            setAlertesNonLues(0);
            toast.success('Toutes les alertes marquées comme lues');
        } catch (error) {
            toast.error('Erreur lors du marquage');
        }
    };

    const getSpaceColor = (type) => {
        const colors = {
            boutique: '#f59e0b',
            depot: '#3b82f6',
            bureau: '#10b981',
            stand: '#8b5cf6',
            commun: '#94a3b8',
            bureau_directeur: '#0ea5e9',
            bureau_open: '#06b6d4',
            salle_reunion: '#8b5cf6',
            espace_vert: '#22c55e',
            couloir: '#94a3b8',
            ascenseur: '#f472b6',
            porte: '#8b5cf6'
        };
        return colors[type] || '#94a3b8';
    };

    const getSiteEtages = (siteId) => {
        return etages.filter(e => e.siteId === siteId);
    };

    const getSiteEspaces = (siteId) => {
        return espaces.filter(e => e.siteId === siteId);
    };

    // Créer un icône personnalisé pour les marqueurs
    const createCustomIcon = (site, isHovered) => {
        const size = isHovered ? 36 : 28;
        const color = isHovered ? '#1a5f7a' : '#3b82f6';
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:${isHovered ? '14' : '11'}px;color:white;font-weight:bold;transition:all 0.3s;">🏢</div>`,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon, color, bgColor, onClick }) => (
        <div 
            onClick={onClick}
            style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{value}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{title}</div>
                </div>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: bgColor || '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: color || '#64748b'
                }}>
                    <i className={`fas ${icon}`}></i>
                </div>
            </div>
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: color || '#64748b',
                borderRadius: '0 0 12px 12px'
            }} />
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-chart-pie" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Tableau de bord
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Bienvenue {user?.nom || 'Utilisateur'} · {user?.role === 'admin' ? 'Administrateur' : user?.role === 'gestionnaire' ? 'Gestionnaire' : user?.role === 'comptable' ? 'Comptable' : 'Consultation'}
                </p>
            </div>

            {/* ===== BARRE D'ALERTES ===== */}
            {alertes.length > 0 && (
                <div style={{ 
                    marginBottom: '20px',
                    background: alertesNonLues > 0 ? '#fef2f2' : '#f8fafc',
                    borderRadius: '12px',
                    border: `1px solid ${alertesNonLues > 0 ? '#fca5a5' : '#e2e8f0'}`,
                    padding: '16px 20px',
                    position: 'relative'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: alertesNonLues > 0 ? '#ef4444' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '18px'
                            }}>
                                <i className={`fas ${alertesNonLues > 0 ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', color: '#0f172a' }}>
                                    {alertesNonLues > 0 ? `${alertesNonLues} alerte${alertesNonLues > 1 ? 's' : ''} non lue${alertesNonLues > 1 ? 's' : ''}` : 'Toutes les alertes sont lues'}
                                    <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8', marginLeft: '8px' }}>
                                        {alertes.length} au total
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {alertesNonLues > 0 ? 'Cliquez sur une alerte pour la marquer comme lue' : 'Aucune alerte en attente'}
                                </div>
                            </div>
                        </div>
                        {alertesNonLues > 0 && (
                            <button
                                onClick={markAllAlertesAsRead}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    background: '#fff',
                                    color: '#1a5f7a',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#1a5f7a';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                            >
                                <i className="fas fa-check-double"></i>
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* Liste des alertes */}
                    <div style={{ 
                        marginTop: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        {alertes.slice(0, 5).map((alerte) => (
                            <div 
                                key={alerte.id}
                                onClick={() => !alerte.lu && markAlerteAsRead(alerte.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    background: alerte.lu ? '#f8fafc' : '#fff',
                                    border: `1px solid ${alerte.lu ? '#e2e8f0' : '#fca5a5'}`,
                                    cursor: alerte.lu ? 'default' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: alerte.lu ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!alerte.lu) {
                                        e.currentTarget.style.background = '#fef2f2';
                                        e.currentTarget.style.borderColor = '#ef4444';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!alerte.lu) {
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.borderColor = '#fca5a5';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: alerte.lu ? '#94a3b8' : '#ef4444',
                                    flexShrink: 0
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontSize: '13px', 
                                        fontWeight: alerte.lu ? '400' : '500',
                                        color: alerte.lu ? '#64748b' : '#0f172a'
                                    }}>
                                        {alerte.message}
                                    </div>
                                    <div style={{ 
                                        fontSize: '11px', 
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{ 
                                            padding: '1px 8px',
                                            borderRadius: '12px',
                                            background: alerte.type === 'urgent' ? '#fef2f2' : '#eff6ff',
                                            color: alerte.type === 'urgent' ? '#dc2626' : '#1a5f7a',
                                            fontSize: '10px',
                                            fontWeight: '600'
                                        }}>
                                            {alerte.type || 'info'}
                                        </span>
                                        <span>
                                            {new Date(alerte.date || alerte.createdAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        {!alerte.lu && (
                                            <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: '600' }}>
                                                ● Non lue
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!alerte.lu && (
                                    <div style={{ 
                                        fontSize: '18px',
                                        color: '#94a3b8'
                                    }}>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                )}
                            </div>
                        ))}
                        {alertes.length > 5 && (
                            <div style={{ 
                                textAlign: 'center',
                                fontSize: '12px',
                                color: '#94a3b8',
                                padding: '4px'
                            }}>
                                <i className="fas fa-ellipsis-h"></i> {alertes.length - 5} autre{alertes.length - 5 > 1 ? 's' : ''} alerte{alertes.length - 5 > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Statistiques */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '16px', 
                marginBottom: '24px' 
            }}>
                <StatCard 
                    title="Sites" 
                    value={stats.sites} 
                    icon="fa-map-marked-alt" 
                    color="#1a5f7a" 
                    bgColor="#e6f0f5"
                    onClick={() => navigate('/espaces')}
                />
                <StatCard 
                    title="Espaces" 
                    value={stats.espaces} 
                    icon="fa-door-open" 
                    color="#3b82f6" 
                    bgColor="#eff6ff"
                    onClick={() => navigate('/espaces')}
                />
                <StatCard 
                    title="Disponibles" 
                    value={stats.disponibles} 
                    icon="fa-check-circle" 
                    color="#22c55e" 
                    bgColor="#f0fdf4"
                    onClick={() => navigate('/espaces')}
                />
                <StatCard 
                    title="Locataires" 
                    value={stats.locataires} 
                    icon="fa-users" 
                    color="#8b5cf6" 
                    bgColor="#f5f3ff"
                    onClick={() => navigate('/locataires')}
                />
                <StatCard 
                    title="Contrats actifs" 
                    value={stats.actifs} 
                    icon="fa-file-signature" 
                    color="#10b981" 
                    bgColor="#ecfdf5"
                    onClick={() => navigate('/contrats')}
                />
                <StatCard 
                    title="Impayés" 
                    value={stats.impayes} 
                    icon="fa-exclamation-triangle" 
                    color="#ef4444" 
                    bgColor="#fef2f2"
                    onClick={() => navigate('/factures')}
                />
            </div>

            {/* Carte interactive avec popups */}
            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                padding: '20px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                        <i className="fas fa-map" style={{ marginRight: '8px', color: '#1a5f7a' }}></i>
                        Carte interactive des sites
                        <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8', marginLeft: '8px' }}>
                            {sites.length} site(s) · Survolez pour voir les détails
                        </span>
                    </span>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/espaces')}
                        style={{ 
                            padding: '6px 16px', 
                            fontSize: '13px',
                            background: '#1a5f7a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-edit"></i> Gérer les sites
                    </button>
                </div>
                <div style={{ height: '450px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <MapContainer 
                        center={mapCenter} 
                        zoom={12} 
                        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                        scrollWheelZoom={true}
                    >
                        <MapController center={mapCenter} zoom={12} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {sites.map(site => (
                            site.latitude && site.longitude && (
                                <Marker 
                                    key={site.id}
                                    position={[site.latitude, site.longitude]}
                                    icon={createCustomIcon(site, hoveredSite === site.id)}
                                    eventHandlers={{
                                        mouseover: () => {
                                            setHoveredSite(site.id);
                                        },
                                        mouseout: () => {
                                            setHoveredSite(null);
                                        },
                                        click: () => {
                                            setSelectedSite(site);
                                            navigate('/espaces');
                                        }
                                    }}
                                >
                                    <Popup 
                                        closeButton={true}
                                        minWidth={300}
                                        maxWidth={350}
                                    >
                                        <div style={{ 
                                            padding: '4px 0',
                                            fontFamily: 'Inter, sans-serif'
                                        }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '10px',
                                                marginBottom: '8px',
                                                borderBottom: '1px solid #e2e8f0',
                                                paddingBottom: '8px'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '8px',
                                                    background: '#1a5f7a20',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#1a5f7a',
                                                    fontSize: '18px'
                                                }}>
                                                    <i className="fas fa-building"></i>
                                                </div>
                                                <div>
                                                    <h4 style={{ 
                                                        margin: 0, 
                                                        fontSize: '16px', 
                                                        fontWeight: '700', 
                                                        color: '#1a5f7a' 
                                                    }}>
                                                        {site.nom}
                                                    </h4>
                                                    <p style={{ 
                                                        margin: '2px 0 0 0', 
                                                        fontSize: '12px', 
                                                        color: '#64748b' 
                                                    }}>
                                                        {site.adresse || site.ville || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Coordonnées GPS */}
                                            {site.latitude && site.longitude && (
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    color: '#94a3b8',
                                                    marginBottom: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <i className="fas fa-map-pin" style={{ color: '#1a5f7a' }}></i>
                                                    <span style={{ fontFamily: 'monospace' }}>
                                                        {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Étages du site */}
                                            <div style={{ 
                                                marginBottom: '8px',
                                                borderBottom: '1px solid #f1f5f9',
                                                paddingBottom: '8px'
                                            }}>
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    fontWeight: '600', 
                                                    color: '#1e293b',
                                                    marginBottom: '4px'
                                                }}>
                                                    <i className="fas fa-layer-group" style={{ marginRight: '4px' }}></i>
                                                    Étages:
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {getSiteEtages(site.id).map(etage => (
                                                        <span key={etage.id} style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            background: '#eff6ff',
                                                            color: '#1a5f7a',
                                                            fontSize: '11px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {etage.nom} {etage.description ? `(${etage.description})` : ''}
                                                        </span>
                                                    ))}
                                                    {getSiteEtages(site.id).length === 0 && (
                                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                            Aucun étage configuré
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Espaces du site */}
                                            <div style={{ marginBottom: '8px' }}>
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    fontWeight: '600', 
                                                    color: '#1e293b',
                                                    marginBottom: '4px'
                                                }}>
                                                    <i className="fas fa-door-open" style={{ marginRight: '4px' }}></i>
                                                    Espaces:
                                                </div>
                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: '4px'
                                                }}>
                                                    {getSiteEspaces(site.id).slice(0, 6).map(espace => (
                                                        <div key={espace.id} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: '#f8fafc',
                                                            fontSize: '11px',
                                                            color: '#475569'
                                                        }}>
                                                            <span style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                background: espace.statut === 'occupe' ? '#f59e0b' : 
                                                                          espace.statut === 'disponible' ? '#22c55e' : '#94a3b8'
                                                            }}></span>
                                                            {espace.numero} - {espace.designation}
                                                        </div>
                                                    ))}
                                                    {getSiteEspaces(site.id).length > 6 && (
                                                        <div style={{ 
                                                            fontSize: '11px', 
                                                            color: '#94a3b8',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            +{getSiteEspaces(site.id).length - 6} autres espaces
                                                        </div>
                                                    )}
                                                </div>
                                                {getSiteEspaces(site.id).length === 0 && (
                                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        Aucun espace
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Statistiques rapides */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '4px',
                                                borderTop: '1px solid #e2e8f0',
                                                paddingTop: '8px',
                                                marginTop: '4px'
                                            }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a5f7a' }}>
                                                        {getSiteEspaces(site.id).length}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Espaces</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
                                                        {getSiteEspaces(site.id).filter(e => e.statut === 'occupe').length}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Occupés</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#22c55e' }}>
                                                        {getSiteEspaces(site.id).filter(e => e.statut === 'disponible').length}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Disponibles</div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    navigate('/espaces');
                                                }}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '6px 16px',
                                                    background: '#1a5f7a',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    width: '100%',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#0f3b5e'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#1a5f7a'}
                                            >
                                                <i className="fas fa-arrow-right"></i> Voir les détails
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
                {sites.filter(s => s.latitude && s.longitude).length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '30px', 
                        color: '#94a3b8',
                        border: '1px dashed #e2e8f0',
                        borderRadius: '8px',
                        marginTop: '8px'
                    }}>
                        <i className="fas fa-map-marked-alt" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                        Aucun site avec des coordonnées GPS configurées
                    </div>
                )}
            </div>

            {/* Détails des sites */}
            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                padding: '20px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                        <i className="fas fa-building" style={{ marginRight: '8px', color: '#1a5f7a' }}></i>
                        Détails des sites
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{sites.length} site(s)</span>
                </div>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                    gap: '16px' 
                }}>
                    {sites.map(site => {
                        const siteEspaces = espaces.filter(e => e.siteId === site.id);
                        const siteEtagesList = etages.filter(e => e.siteId === site.id);
                        const occupes = siteEspaces.filter(e => e.statut === 'occupe').length;
                        const disponibles = siteEspaces.filter(e => e.statut === 'disponible').length;
                        return (
                            <div 
                                key={site.id}
                                style={{
                                    background: '#f8fafc',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#1a5f7a';
                                    e.currentTarget.style.background = '#f0f4f8';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.background = '#f8fafc';
                                }}
                                onClick={() => navigate('/espaces')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#1a5f7a20',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1a5f7a',
                                        fontSize: '18px'
                                    }}>
                                        <i className="fas fa-building"></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b' }}>{site.nom}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {site.adresse || site.ville || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                            <i className="fas fa-layer-group"></i> {siteEtagesList.length} étages
                                        </div>
                                    </div>
                                </div>
                                {site.latitude && site.longitude && (
                                    <div style={{ 
                                        marginTop: '8px', 
                                        fontSize: '11px', 
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <i className="fas fa-map-pin" style={{ color: '#1a5f7a' }}></i>
                                        <span style={{ fontFamily: 'monospace' }}>
                                            {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                                        </span>
                                    </div>
                                )}
                                <div style={{ 
                                    marginTop: '12px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '6px',
                                    fontSize: '12px',
                                    borderTop: '1px solid #e2e8f0',
                                    paddingTop: '12px'
                                }}>
                                    <span>
                                        <i className="fas fa-door-open" style={{ color: '#3b82f6' }}></i>
                                        Total: {siteEspaces.length}
                                    </span>
                                    <span style={{ color: '#f59e0b' }}>
                                        <i className="fas fa-user"></i> Occupés: {occupes}
                                    </span>
                                    <span style={{ color: '#22c55e' }}>
                                        <i className="fas fa-check-circle"></i> Dispos: {disponibles}
                                    </span>
                                    <span style={{ color: '#1a5f7a' }}>
                                        <i className="fas fa-percent"></i> Occup: {siteEspaces.length > 0 ? Math.round((occupes / siteEspaces.length) * 100) : 0}%
                                    </span>
                                </div>
                                {siteEtagesList.length > 0 && (
                                    <div style={{ 
                                        marginTop: '8px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px'
                                    }}>
                                        {siteEtagesList.map(etage => (
                                            <span key={etage.id} style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                background: '#eff6ff',
                                                color: '#1a5f7a',
                                                fontSize: '10px',
                                                fontWeight: '500'
                                            }}>
                                                {etage.nom}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {sites.length === 0 && (
                        <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '30px',
                            color: '#94a3b8'
                        }}>
                            <i className="fas fa-map-marked-alt" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                            Aucun site configuré
                        </div>
                    )}
                </div>
            </div>

            {/* Contrats récents */}
            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                        <i className="fas fa-clock" style={{ marginRight: '8px', color: '#1a5f7a' }}></i>
                        Contrats récents
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{stats.contrats} au total</span>
                </div>
                <div className="table-wrap" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>#</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Espace</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Locataire</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Début</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Fin</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Loyer</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentContrats.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '10px 12px' }}>#{c.id}</td>
                                    <td style={{ padding: '10px 12px' }}>N/A</td>
                                    <td style={{ padding: '10px 12px' }}>N/A</td>
                                    <td style={{ padding: '10px 12px' }}>{c.dateDebut || ''}</td>
                                    <td style={{ padding: '10px 12px' }}>{c.dateFin || ''}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{c.montantLoyer || 0} MAD</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span className={`badge-status ${c.statut === 'actif' ? 'badge-success' : 'badge-neutral'}`} style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '11px', 
                                            fontWeight: '600',
                                            background: c.statut === 'actif' ? '#dcfce7' : '#f1f5f9',
                                            color: c.statut === 'actif' ? '#166534' : '#64748b'
                                        }}>
                                            {c.statut}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentContrats.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>
                                        <i className="fas fa-file-signature" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        Aucun contrat récent
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;