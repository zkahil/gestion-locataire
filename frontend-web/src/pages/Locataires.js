// src/pages/Locataires.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Locataires = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLocataire, setEditingLocataire] = useState(null);
    const [formData, setFormData] = useState({
        type: 'personne_physique',
        nomComplet: '',
        cin: '',
        ice: '',
        registreCommerce: '',
        identifiantFiscal: '',
        adresse: '',
        telephone: '',
        email: '',
        representantLegal: ''
    });

    const isEditable = user?.role === 'admin' || user?.role === 'gestionnaire';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/locataires');
            setData(res.data.data || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        }
        setLoading(false);
    };

    const openModal = (locataire = null) => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour modifier');
            return;
        }
        if (locataire) {
            setEditingLocataire(locataire);
            setFormData({
                type: locataire.type || 'personne_physique',
                nomComplet: locataire.nomComplet || '',
                cin: locataire.cin || '',
                ice: locataire.ice || '',
                registreCommerce: locataire.registreCommerce || '',
                identifiantFiscal: locataire.identifiantFiscal || '',
                adresse: locataire.adresse || '',
                telephone: locataire.telephone || '',
                email: locataire.email || '',
                representantLegal: locataire.representantLegal || ''
            });
        } else {
            setEditingLocataire(null);
            setFormData({
                type: 'personne_physique',
                nomComplet: '',
                cin: '',
                ice: '',
                registreCommerce: '',
                identifiantFiscal: '',
                adresse: '',
                telephone: '',
                email: '',
                representantLegal: ''
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingLocataire(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditable) return;
        try {
            const dataToSend = { ...formData };

            if (editingLocataire) {
                await api.put(`/locataires/${editingLocataire.id}`, dataToSend);
                toast.success('Locataire modifié avec succès');
            } else {
                await api.post('/locataires', dataToSend);
                toast.success('Locataire créé avec succès');
            }
            closeModal();
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deleteLocataire = async (id) => {
        if (!isEditable) return;
        if (!confirm('Supprimer ce locataire ?')) return;
        try {
            await api.delete(`/locataires/${id}`);
            toast.success('Locataire supprimé');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-users" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Locataires
                    <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748b', marginLeft: '12px' }}>
                        {data.length} locataire(s)
                    </span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Gestion des locataires et leurs informations
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                        <i className="fas fa-user-tie" style={{ marginRight: '6px' }}></i>
                        {data.filter(l => l.type === 'societe').length} sociétés
                    </span>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                        <i className="fas fa-user" style={{ marginRight: '6px' }}></i>
                        {data.filter(l => l.type === 'personne_physique').length} particuliers
                    </span>
                </div>
                {isEditable && (
                    <button 
                        className="btn btn-primary" 
                        onClick={() => openModal()} 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '8px 20px', 
                            borderRadius: '8px', 
                            fontWeight: '500', 
                            fontSize: '14px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            background: '#1a5f7a', 
                            color: '#fff',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0f3b5e'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#1a5f7a'}
                    >
                        <i className="fas fa-plus"></i> Ajouter un locataire
                    </button>
                )}
            </div>

            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div className="table-wrap" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>#</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Nom / Raison sociale</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Type</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>CIN</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Téléphone</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px 16px' }}>#{item.id}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{item.nomComplet}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ 
                                            padding: '2px 10px', 
                                            borderRadius: '12px', 
                                            fontSize: '11px',
                                            background: item.type === 'societe' ? '#dbeafe' : '#f1f5f9',
                                            color: item.type === 'societe' ? '#1e40af' : '#64748b'
                                        }}>
                                            {item.type === 'societe' ? 'Société' : 'Particulier'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>{item.cin || '-'}</td>
                                    <td style={{ padding: '12px 16px' }}>{item.telephone || '-'}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {isEditable ? (
                                            <>
                                                <button 
                                                    className="btn btn-xs btn-outline" 
                                                    style={{ 
                                                        padding: '4px 10px', 
                                                        fontSize: '12px', 
                                                        background: 'transparent', 
                                                        border: '1px solid #cbd5e1', 
                                                        borderRadius: '6px', 
                                                        cursor: 'pointer',
                                                        marginRight: '6px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => openModal(item)}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-xs btn-danger" 
                                                    style={{ 
                                                        padding: '4px 10px', 
                                                        fontSize: '12px', 
                                                        background: '#ef4444', 
                                                        color: '#fff', 
                                                        border: 'none', 
                                                        borderRadius: '6px', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => deleteLocataire(item.id)}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Lecture seule</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                        <i className="fas fa-users" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        Aucun locataire
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Locataire */}
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
                        maxWidth: '700px', 
                        width: '100%', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        padding: '24px', 
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.25s ease'
                    }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                                {editingLocataire ? 'Modifier un locataire' : 'Ajouter un locataire'}
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Nom / Raison sociale *</label>
                                <input type="text" name="nomComplet" value={formData.nomComplet} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="personne_physique">Personne physique</option>
                                        <option value="societe">Société</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>CIN</label>
                                    <input type="text" name="cin" value={formData.cin} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>ICE</label>
                                    <input type="text" name="ice" value={formData.ice} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Téléphone *</label>
                                    <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Registre commerce</label>
                                    <input type="text" name="registreCommerce" value={formData.registreCommerce} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Identifiant fiscal</label>
                                    <input type="text" name="identifiantFiscal" value={formData.identifiantFiscal} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Adresse</label>
                                <input type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Représentant légal</label>
                                <input type="text" name="representantLegal" value={formData.representantLegal} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
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
                                    <i className="fas fa-save"></i> Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Locataires;