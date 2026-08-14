// src/pages/Alertes.js - Version avec liens vers contrats et échéances

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Alertes = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [contrats, setContrats] = useState([]);
    const [factures, setFactures] = useState([]);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedAlerteId, setSelectedAlerteId] = useState(null);
    const [linkType, setLinkType] = useState('contrat');
    const [linkId, setLinkId] = useState('');
    
    const [formData, setFormData] = useState({
        type: 'info',
        message: '',
        userId: user?.id || '',
        contratId: null,
        factureId: null,
        dateEcheance: null
    });
    const [formErrors, setFormErrors] = useState({});

    const isEditable = user?.role === 'admin' || user?.role === 'gestionnaire';

    useEffect(() => {
        loadData();
        loadContrats();
        loadFactures();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/api/alertes');
            setData(res.data.data || []);
            setError(null);
        } catch (error) {
            console.error('❌ Erreur chargement alertes:', error);
            const errorMessage = error.response?.data?.message || 'Erreur de chargement des alertes';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const loadContrats = async () => {
        try {
            const res = await api.get('/api/contrats');
            setContrats(res.data.data || []);
        } catch (error) {
            console.error('❌ Erreur chargement contrats:', error);
        }
    };

    const loadFactures = async () => {
        try {
            const res = await api.get('/api/factures');
            setFactures(res.data.data || []);
        } catch (error) {
            console.error('❌ Erreur chargement factures:', error);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.message.trim()) {
            errors.message = 'Le message est requis';
        }
        if (!formData.type) {
            errors.type = 'Le type est requis';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const markAsRead = async (id) => {
        if (actionInProgress) return;
        setActionInProgress(true);
        try {
            await api.put(`/api/alertes/${id}/read`);
            toast.success('✅ Alerte marquée comme lue');
            await loadData();
        } catch (error) {
            console.error('❌ Erreur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors du marquage');
        } finally {
            setActionInProgress(false);
        }
    };

    const markAllAsRead = async () => {
        if (actionInProgress) return;
        if (!window.confirm('Marquer toutes les alertes comme lues ?')) return;
        
        setActionInProgress(true);
        try {
            await api.put('/api/alertes/read-all');
            toast.success('✅ Toutes les alertes marquées comme lues');
            await loadData();
        } catch (error) {
            console.error('❌ Erreur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors du marquage');
        } finally {
            setActionInProgress(false);
        }
    };

    const deleteAlerte = async (id) => {
        if (!isEditable) return;
        if (deletingId) return;
        
        const alerte = data.find(a => a.id === id);
        if (!window.confirm(`⚠️ Supprimer l'alerte : "${alerte?.message?.substring(0, 50)}..." ?`)) return;
        
        setDeletingId(id);
        try {
            await api.delete(`/api/alertes/${id}`);
            toast.success('✅ Alerte supprimée avec succès');
            await loadData();
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            let errorMessage = 'Erreur lors de la suppression';
            if (error.response?.status === 403) {
                errorMessage = 'Vous n\'avez pas les droits pour supprimer cette alerte';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setDeletingId(null);
        }
    };

    const openModal = (type = null) => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour créer une alerte');
            return;
        }
        setFormErrors({});
        setFormData({
            type: type || 'info',
            message: '',
            userId: user?.id || '',
            contratId: null,
            factureId: null,
            dateEcheance: null
        });
        setModalOpen(true);
    };

    const openLinkModal = (alerteId) => {
        setSelectedAlerteId(alerteId);
        setLinkType('contrat');
        setLinkId('');
        setShowLinkModal(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setFormErrors({});
        setFormData({
            type: 'info',
            message: '',
            userId: user?.id || '',
            contratId: null,
            factureId: null,
            dateEcheance: null
        });
    };

    const closeLinkModal = () => {
        setShowLinkModal(false);
        setSelectedAlerteId(null);
        setLinkType('contrat');
        setLinkId('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditable) return;
        
        if (!validateForm()) {
            toast.error('Veuillez corriger les erreurs du formulaire');
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                userId: user?.id || null,
                contratId: formData.contratId ? parseInt(formData.contratId) : null,
                factureId: formData.factureId ? parseInt(formData.factureId) : null,
                dateEcheance: formData.dateEcheance || null
            };
            await api.post('/api/alertes', dataToSend);
            toast.success('✅ Alerte créée avec succès');
            closeModal();
            await loadData();
        } catch (error) {
            console.error('❌ Erreur création:', error);
            const message = error.response?.data?.message || 'Erreur lors de la création';
            toast.error(`❌ ${message}`);
        }
    };

    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlerteId) return;

        try {
            const updateData = {};
            if (linkType === 'contrat') {
                updateData.contratId = parseInt(linkId);
            } else if (linkType === 'facture') {
                updateData.factureId = parseInt(linkId);
            }
            
            await api.put(`/api/alertes/${selectedAlerteId}`, updateData);
            toast.success('✅ Alerte liée avec succès');
            closeLinkModal();
            await loadData();
        } catch (error) {
            console.error('❌ Erreur liaison:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la liaison');
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
            validation: 'fa-check-circle',
            rappel: 'fa-bell',
            alerte: 'fa-exclamation-circle',
            facture: 'fa-receipt',
            caution: 'fa-shield-alt'
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
            validation: '#16a34a',
            rappel: '#f59e0b',
            alerte: '#ef4444',
            facture: '#0ea5e9',
            caution: '#f472b6'
        };
        return colors[type] || '#94a3b8';
    };

    const getTypeLabel = (type) => {
        const labels = {
            echeance: '📅 Échéance',
            impaye: '🚨 Impayé',
            info: 'ℹ️ Information',
            contrat: '📄 Contrat',
            resiliation: '❌ Résiliation',
            paiement: '✅ Paiement',
            validation: '✅ Validation',
            rappel: '🔔 Rappel',
            alerte: '⚠️ Alerte',
            facture: '🧾 Facture',
            caution: '🛡️ Caution'
        };
        return labels[type] || type;
    };

    const formatDate = (date) => {
        if (!date) return 'Date inconnue';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        
        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
        
        return d.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLinkInfo = (alerte) => {
        if (alerte.contratId) {
            const contrat = contrats.find(c => c.id === alerte.contratId);
            return {
                type: 'contrat',
                label: `Contrat #${alerte.contratId}`,
                details: contrat ? `${contrat.montantLoyer} MAD` : '',
                url: `/contrats/${alerte.contratId}`
            };
        }
        if (alerte.factureId) {
            const facture = factures.find(f => f.id === alerte.factureId);
            return {
                type: 'facture',
                label: `Facture #${alerte.factureId}`,
                details: facture ? `${facture.montantTotal} MAD` : '',
                url: `/factures/${alerte.factureId}`
            };
        }
        return null;
    };

    const generateAlerteEcheance = (contratId) => {
        openModal('echeance');
        setFormData(prev => ({
            ...prev,
            contratId: contratId,
            message: `Échéance de paiement pour le contrat #${contratId}`
        }));
    };

    const generateAlerteImpaye = (factureId) => {
        openModal('impaye');
        setFormData(prev => ({
            ...prev,
            factureId: factureId,
            message: `Facture #${factureId} en impayé`
        }));
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
                <span style={{ marginLeft: '12px', color: '#64748b' }}>Chargement des alertes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #fee2e2'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Erreur de chargement</h3>
                <p style={{ color: '#64748b' }}>{error}</p>
                <button 
                    onClick={loadData}
                    style={{
                        marginTop: '16px',
                        padding: '8px 24px',
                        background: '#1a5f7a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    const filteredData = filterType === 'all' 
        ? data 
        : data.filter(a => a.type === filterType);

    const unreadCount = data.filter(a => a.lu === 0 || a.lu === false).length;

    // Types d'alertes disponibles
    const alertTypes = [
        { value: 'all', label: 'Toutes' },
        { value: 'info', label: 'ℹ️ Information' },
        { value: 'echeance', label: '📅 Échéance' },
        { value: 'impaye', label: '🚨 Impayé' },
        { value: 'contrat', label: '📄 Contrat' },
        { value: 'resiliation', label: '❌ Résiliation' },
        { value: 'paiement', label: '✅ Paiement' },
        { value: 'validation', label: '✅ Validation' },
        { value: 'facture', label: '🧾 Facture' },
        { value: 'caution', label: '🛡️ Caution' }
    ];

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
                    Gérez vos alertes liées aux contrats, échéances et paiements
                </p>
            </div>

            {/* Filtres */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px', 
                flexWrap: 'wrap', 
                gap: '12px' 
            }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {alertTypes.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setFilterType(type.value)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: `1px solid ${filterType === type.value ? '#1a5f7a' : '#e2e8f0'}`,
                                background: filterType === type.value ? '#1a5f7a' : '#fff',
                                color: filterType === type.value ? '#fff' : '#64748b',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: filterType === type.value ? '600' : '400'
                            }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {unreadCount > 0 && (
                        <button 
                            className="btn btn-outline" 
                            onClick={markAllAsRead} 
                            disabled={actionInProgress}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                fontWeight: '500', 
                                fontSize: '13px', 
                                border: '1px solid #cbd5e1', 
                                cursor: actionInProgress ? 'not-allowed' : 'pointer', 
                                background: 'transparent', 
                                color: '#1a5f7a',
                                opacity: actionInProgress ? 0.6 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            <i className="fas fa-check-double"></i> 
                            {actionInProgress ? 'En cours...' : 'Tout marquer lu'}
                        </button>
                    )}
                    {isEditable && (
                        <>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => openModal()}
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
                            >
                                <i className="fas fa-plus"></i> Ajouter
                            </button>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => openModal('echeance')}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    fontWeight: '500', 
                                    fontSize: '13px', 
                                    border: '1px solid #f59e0b', 
                                    cursor: 'pointer', 
                                    background: 'transparent', 
                                    color: '#f59e0b',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="fas fa-clock"></i> Échéance
                            </button>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => openModal('impaye')}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    fontWeight: '500', 
                                    fontSize: '13px', 
                                    border: '1px solid #ef4444', 
                                    cursor: 'pointer', 
                                    background: 'transparent', 
                                    color: '#ef4444',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="fas fa-exclamation-triangle"></i> Impayé
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Liste des alertes */}
            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                {filteredData.length > 0 ? (
                    filteredData.map(item => {
                        const isUnread = item.lu === 0 || item.lu === false;
                        const icon = getTypeIcon(item.type);
                        const color = getTypeColor(item.type);
                        const label = getTypeLabel(item.type);
                        const isDeleting = deletingId === item.id;
                        const linkInfo = getLinkInfo(item);
                        
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
                                    transition: 'all 0.2s',
                                    opacity: isDeleting ? 0.5 : 1,
                                    position: 'relative'
                                }}
                            >
                                {isDeleting && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.7)',
                                        borderRadius: '12px',
                                        zIndex: 10
                                    }}>
                                        <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                                    </div>
                                )}
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
                                            {linkInfo && (
                                                <a 
                                                    href={linkInfo.url}
                                                    style={{
                                                        fontSize: '10px',
                                                        color: '#1a5f7a',
                                                        textDecoration: 'none',
                                                        background: '#e6f4ff',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <i className="fas fa-link"></i>
                                                    {linkInfo.label}
                                                    {linkInfo.details && ` (${linkInfo.details})`}
                                                </a>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <i className="far fa-clock"></i>
                                            {formatDate(item.date || item.createdAt)}
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
                                            {item.contratId && (
                                                <span style={{ 
                                                    color: '#8b5cf6',
                                                    fontSize: '10px'
                                                }}>
                                                    <i className="fas fa-file-signature" style={{ marginRight: '2px' }}></i>
                                                    Contrat #{item.contratId}
                                                </span>
                                            )}
                                            {item.factureId && (
                                                <span style={{ 
                                                    color: '#0ea5e9',
                                                    fontSize: '10px'
                                                }}>
                                                    <i className="fas fa-receipt" style={{ marginRight: '2px' }}></i>
                                                    Facture #{item.factureId}
                                                </span>
                                            )}
                                            {item.dateEcheance && (
                                                <span style={{ 
                                                    color: '#f59e0b',
                                                    fontSize: '10px'
                                                }}>
                                                    <i className="fas fa-calendar-alt" style={{ marginRight: '2px' }}></i>
                                                    Échéance: {formatDate(item.dateEcheance)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
                                    {!linkInfo && isEditable && (
                                        <button 
                                            onClick={() => openLinkModal(item.id)}
                                            disabled={isDeleting}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                cursor: isDeleting ? 'not-allowed' : 'pointer', 
                                                color: '#64748b',
                                                padding: '6px 8px',
                                                borderRadius: '6px',
                                                opacity: isDeleting ? 0.5 : 1,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.background = '#f1f5f9';
                                                    e.currentTarget.style.color = '#1a5f7a';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = '#64748b';
                                                }
                                            }}
                                            title="Lier à un contrat ou facture"
                                        >
                                            <i className="fas fa-link"></i>
                                        </button>
                                    )}
                                    {isUnread && (
                                        <button 
                                            onClick={() => markAsRead(item.id)}
                                            disabled={actionInProgress || isDeleting}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                cursor: actionInProgress || isDeleting ? 'not-allowed' : 'pointer', 
                                                color: '#64748b',
                                                padding: '6px 8px',
                                                borderRadius: '6px',
                                                opacity: actionInProgress || isDeleting ? 0.5 : 1,
                                                transition: 'all 0.2s'
                                            }}
                                            title="Marquer comme lu"
                                        >
                                            <i className="fas fa-check"></i>
                                        </button>
                                    )}
                                    {isEditable && (
                                        <button 
                                            onClick={() => deleteAlerte(item.id)}
                                            disabled={isDeleting}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                cursor: isDeleting ? 'not-allowed' : 'pointer', 
                                                color: '#94a3b8',
                                                padding: '6px 8px',
                                                borderRadius: '6px',
                                                opacity: isDeleting ? 0.5 : 1,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.background = '#fef2f2';
                                                    e.currentTarget.style.color = '#ef4444';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isDeleting) {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = '#94a3b8';
                                                }
                                            }}
                                            title="Supprimer"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <i className="fas fa-check-circle" style={{ fontSize: '48px', color: '#16a34a', display: 'block', marginBottom: '16px' }}></i>
                        <div style={{ fontSize: '18px', fontWeight: '500', color: '#1e293b' }}>Tout est calme !</div>
                        <div style={{ fontSize: '14px', marginTop: '4px' }}>Aucune alerte pour le moment</div>
                        {isEditable && (
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => openModal()}
                                    style={{
                                        padding: '8px 20px',
                                        background: '#1a5f7a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
                                    Créer une alerte
                                </button>
                                <button 
                                    onClick={() => openModal('echeance')}
                                    style={{
                                        padding: '8px 20px',
                                        background: '#f59e0b',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
                                    Ajouter échéance
                                </button>
                                <button 
                                    onClick={() => openModal('impaye')}
                                    style={{
                                        padding: '8px 20px',
                                        background: '#ef4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i>
                                    Ajouter impayé
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Création Alerte */}
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
                        maxWidth: '600px', 
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
                                {formData.type === 'echeance' ? 'Ajouter une échéance' :
                                 formData.type === 'impaye' ? 'Ajouter un impayé' :
                                 'Ajouter une alerte'}
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                    Type *
                                </label>
                                <select 
                                    name="type" 
                                    value={formData.type} 
                                    onChange={handleInputChange} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px 12px', 
                                        border: `1px solid ${formErrors.type ? '#ef4444' : '#cbd5e1'}`, 
                                        borderRadius: '6px', 
                                        fontSize: '14px' 
                                    }}
                                >
                                    <option value="info">ℹ️ Information</option>
                                    <option value="echeance">📅 Échéance</option>
                                    <option value="impaye">🚨 Impayé</option>
                                    <option value="contrat">📄 Contrat</option>
                                    <option value="resiliation">❌ Résiliation</option>
                                    <option value="paiement">✅ Paiement</option>
                                    <option value="validation">✅ Validation</option>
                                    <option value="facture">🧾 Facture</option>
                                    <option value="caution">🛡️ Caution</option>
                                </select>
                                {formErrors.type && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.type}</span>}
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                    Message *
                                </label>
                                <textarea 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleInputChange} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px 12px', 
                                        border: `1px solid ${formErrors.message ? '#ef4444' : '#cbd5e1'}`, 
                                        borderRadius: '6px', 
                                        fontSize: '14px', 
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }} 
                                    required 
                                />
                                {formErrors.message && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.message}</span>}
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Lier à un contrat
                                    </label>
                                    <select 
                                        name="contratId" 
                                        value={formData.contratId || ''} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: '1px solid #cbd5e1', 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }}
                                    >
                                        <option value="">Aucun contrat</option>
                                        {contrats.map(c => (
                                            <option key={c.id} value={c.id}>
                                                #{c.id} - {c.montantLoyer} MAD
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Lier à une facture
                                    </label>
                                    <select 
                                        name="factureId" 
                                        value={formData.factureId || ''} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: '1px solid #cbd5e1', 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }}
                                    >
                                        <option value="">Aucune facture</option>
                                        {factures.map(f => (
                                            <option key={f.id} value={f.id}>
                                                #{f.id} - {f.montantTotal} MAD
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                    Date d'échéance (optionnelle)
                                </label>
                                <input 
                                    type="datetime-local" 
                                    name="dateEcheance" 
                                    value={formData.dateEcheance || ''} 
                                    onChange={handleInputChange} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px 12px', 
                                        border: '1px solid #cbd5e1', 
                                        borderRadius: '6px', 
                                        fontSize: '14px' 
                                    }}
                                />
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
                                    color: '#1a5f7a'
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
                                    color: '#fff'
                                }}>
                                    <i className="fas fa-save"></i> Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Liaison */}
            {showLinkModal && isEditable && (
                <div className="modal-overlay" style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    backdropFilter: 'blur(4px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000, 
                    padding: '1rem'
                }}>
                    <div className="modal" style={{ 
                        background: '#fff', 
                        borderRadius: '12px', 
                        maxWidth: '500px', 
                        width: '100%', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        padding: '24px', 
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                            <i className="fas fa-link" style={{ color: '#1a5f7a', marginRight: '8px' }}></i>
                            Lier l'alerte
                        </h2>
                        <form onSubmit={handleLinkSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                    Type de lien *
                                </label>
                                <select 
                                    value={linkType} 
                                    onChange={(e) => setLinkType(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px 12px', 
                                        border: '1px solid #cbd5e1', 
                                        borderRadius: '6px', 
                                        fontSize: '14px' 
                                    }}
                                >
                                    <option value="contrat">📄 Contrat</option>
                                    <option value="facture">🧾 Facture</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                    Sélectionner {linkType === 'contrat' ? 'le contrat' : 'la facture'} *
                                </label>
                                <select 
                                    value={linkId} 
                                    onChange={(e) => setLinkId(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '8px 12px', 
                                        border: '1px solid #cbd5e1', 
                                        borderRadius: '6px', 
                                        fontSize: '14px' 
                                    }}
                                    required
                                >
                                    <option value="">Choisir...</option>
                                    {linkType === 'contrat' 
                                        ? contrats.map(c => (
                                            <option key={c.id} value={c.id}>
                                                #{c.id} - {c.montantLoyer} MAD - {c.statut}
                                            </option>
                                          ))
                                        : factures.map(f => (
                                            <option key={f.id} value={f.id}>
                                                #{f.id} - {f.montantTotal} MAD - {f.statut}
                                            </option>
                                          ))
                                    }
                                </select>
                            </div>
                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" onClick={closeLinkModal} style={{ 
                                    padding: '8px 20px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #cbd5e1', 
                                    cursor: 'pointer', 
                                    background: 'transparent', 
                                    color: '#1a5f7a'
                                }}>
                                    Annuler
                                </button>
                                <button type="submit" style={{ 
                                    padding: '8px 20px', 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    background: '#1a5f7a', 
                                    color: '#fff'
                                }}>
                                    <i className="fas fa-link" style={{ marginRight: '6px' }}></i>
                                    Lier
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