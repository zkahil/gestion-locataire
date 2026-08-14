// src/pages/Alertes.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Alertes = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'info',
        message: '',
        userId: user?.id || ''
    });

    const isEditable = user?.role === 'admin' || user?.role === 'gestionnaire';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/api/alertes');
            setData(res.data.data || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        }
        setLoading(false);
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/alertes/${id}/read`);
            toast.success('Alerte marquée comme lue');
            loadData();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/alertes/read-all');
            toast.success('Toutes les alertes marquées comme lues');
            loadData();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const deleteAlerte = async (id) => {
        if (!isEditable) return;
        if (!confirm('Supprimer cette alerte ?')) return;
        try {
            await api.delete(`/alertes/${id}`);
            toast.success('Alerte supprimée');
            loadData();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const openModal = () => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour créer une alerte');
            return;
        }
        setFormData({
            type: 'info',
            message: '',
            userId: user?.id || ''
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditable) return;
        try {
            await api.post('/alertes', formData);
            toast.success('Alerte créée avec succès');
            closeModal();
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const getTypeIcon = (type) => {
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

    const getTypeColor = (type) => {
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

    const getTypeLabel = (type) => {
        const labels = {
            echeance: 'Échéance',
            impaye: 'Impayé',
            info: 'Information',
            contrat: 'Contrat',
            resiliation: 'Résiliation',
            paiement: 'Paiement',
            validation: 'Validation'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const unreadCount = data.filter(a => a.lu === 0 || a.lu === false).length;

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-bell" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Alertes
                    {unreadCount > 0 && (
                        <span style={{ 
                            fontSize: '14px', 
                            background: '#ef4444', 
                            color: '#fff', 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            marginLeft: '12px',
                            fontWeight: '600'
                        }}>
                            {unreadCount} non lue(s)
                        </span>
                    )}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Gérez vos alertes et notifications
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                    <i className="fas fa-bell" style={{ marginRight: '6px' }}></i>
                    {data.length} alerte(s)
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {unreadCount > 0 && (
                        <button 
                            className="btn btn-outline" 
                            onClick={markAllAsRead} 
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                fontWeight: '500', 
                                fontSize: '13px', 
                                border: '1px solid #cbd5e1', 
                                cursor: 'pointer', 
                                background: 'transparent', 
                                color: '#1a5f7a',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <i className="fas fa-check-double"></i> Tout marquer lu
                        </button>
                    )}
                    {isEditable && (
                        <button 
                            className="btn btn-primary" 
                            onClick={openModal}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                fontWeight: '500', 
                                fontSize: '13px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                background: '#1a5f7a', 
                                color: '#fff',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#0f3b5e'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#1a5f7a'}
                        >
                            <i className="fas fa-plus"></i> Ajouter
                        </button>
                    )}
                </div>
            </div>

            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                {data.map(item => {
                    const isUnread = item.lu === 0 || item.lu === false;
                    const icon = getTypeIcon(item.type);
                    const color = getTypeColor(item.type);
                    const label = getTypeLabel(item.type);
                    return (
                        <div 
                            key={item.id} 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '14px 20px',
                                borderBottom: '1px solid #f1f5f9',
                                background: isUnread ? '#f0f9ff' : '#fff',
                                borderLeft: isUnread ? `4px solid ${color}` : '4px solid transparent',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = isUnread ? '#e6f4ff' : '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? '#f0f9ff' : '#fff'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: `${color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: color,
                                    fontSize: '18px',
                                    flexShrink: 0
                                }}>
                                    <i className={`fas ${icon}`}></i>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ 
                                        fontSize: '14px', 
                                        color: '#1e293b', 
                                        fontWeight: isUnread ? '600' : '400',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {item.message}
                                        <span style={{ 
                                            fontSize: '10px', 
                                            padding: '2px 10px', 
                                            borderRadius: '12px',
                                            background: `${color}20`,
                                            color: color,
                                            fontWeight: '600'
                                        }}>
                                            {label}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <i className="far fa-clock"></i>
                                        {item.date || new Date().toLocaleDateString('fr-FR')}
                                        {isUnread && (
                                            <span style={{ 
                                                background: '#3b82f6', 
                                                color: '#fff', 
                                                padding: '1px 8px', 
                                                borderRadius: '10px', 
                                                fontSize: '9px',
                                                fontWeight: '600'
                                            }}>
                                                Nouveau
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
                                {isUnread && (
                                    <button 
                                        onClick={() => markAsRead(item.id)}
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            color: '#64748b',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        title="Marquer comme lu"
                                    >
                                        <i className="fas fa-check"></i>
                                    </button>
                                )}
                                {isEditable && (
                                    <button 
                                        onClick={() => deleteAlerte(item.id)}
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            color: '#94a3b8',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                        title="Supprimer"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {data.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <i className="fas fa-check-circle" style={{ fontSize: '48px', color: '#16a34a', display: 'block', marginBottom: '16px' }}></i>
                        <div style={{ fontSize: '18px', fontWeight: '500', color: '#1e293b' }}>Tout est calme !</div>
                        <div style={{ fontSize: '14px', marginTop: '4px' }}>Aucune alerte pour le moment</div>
                    </div>
                )}
            </div>

            {/* Modal Ajout Alerte */}
            {modalOpen && isEditable && (
                <div className="modal-overlay" style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    backdropFilter: 'blur(4px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000, 
                    padding: '1rem',
                    animation: 'fadeIn 0.2s'
                }}>
                    <div className="modal" style={{ 
                        background: '#fff', 
                        borderRadius: '12px', 
                        maxWidth: '550px', 
                        width: '100%', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        padding: '24px', 
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.25s ease'
                    }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                                <i className="fas fa-bell" style={{ color: '#1a5f7a', marginRight: '8px' }}></i>
                                Ajouter une alerte
                            </h2>
                            <button className="close" onClick={closeModal} style={{ 
                                background: 'none', 
                                border: 'none', 
                                fontSize: '24px', 
                                cursor: 'pointer', 
                                color: '#94a3b8', 
                                padding: '0 4px'
                            }}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Type</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                    <option value="info">Information</option>
                                    <option value="echeance">Échéance</option>
                                    <option value="impaye">Impayé</option>
                                    <option value="contrat">Contrat</option>
                                    <option value="resiliation">Résiliation</option>
                                    <option value="paiement">Paiement</option>
                                    <option value="validation">Validation</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Message</label>
                                <textarea name="message" value={formData.message} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '80px' }} required />
                            </div>
                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn btn-outline" onClick={closeModal} style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    padding: '8px 20px', 
                                    borderRadius: '8px', 
                                    fontWeight: '500', 
                                    fontSize: '14px', 
                                    border: '1px solid #cbd5e1', 
                                    cursor: 'pointer', 
                                    background: 'transparent', 
                                    color: '#1a5f7a',
                                    transition: 'all 0.2s'
                                }}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    padding: '8px 20px', 
                                    borderRadius: '8px', 
                                    fontWeight: '500', 
                                    fontSize: '14px', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    background: '#1a5f7a', 
                                    color: '#fff',
                                    transition: 'all 0.2s'
                                }}>
                                    <i className="fas fa-save"></i> Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Alertes;