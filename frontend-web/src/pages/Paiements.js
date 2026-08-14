// src/pages/Paiements.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Paiements = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState([]);
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPaiement, setEditingPaiement] = useState(null);
    const [formData, setFormData] = useState({
        factureId: '',
        montant: '',
        datePaiement: '',
        mode: 'virement',
        reference: ''
    });

    const isEditable = user?.role === 'admin' || user?.role === 'comptable';

    useEffect(() => {
        loadData();
        loadFactures();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/api/paiements');
            setData(res.data.data || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        }
        setLoading(false);
    };

    const loadFactures = async () => {
        try {
            const res = await api.get('/api/factures');
            setFactures(res.data.data || []);
        } catch (error) {
            console.error('Erreur chargement factures');
        }
    };

    const openModal = (paiement = null) => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour modifier');
            return;
        }
        if (paiement) {
            setEditingPaiement(paiement);
            setFormData({
                factureId: paiement.factureId || '',
                montant: paiement.montant || '',
                datePaiement: paiement.datePaiement || '',
                mode: paiement.mode || 'virement',
                reference: paiement.reference || ''
            });
        } else {
            setEditingPaiement(null);
            setFormData({
                factureId: '',
                montant: '',
                datePaiement: new Date().toISOString().split('T')[0],
                mode: 'virement',
                reference: ''
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingPaiement(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditable) return;
        try {
            const dataToSend = {
                ...formData,
                factureId: parseInt(formData.factureId),
                montant: parseFloat(formData.montant) || 0
            };

            if (editingPaiement) {
                await api.put(`/paiements/${editingPaiement.id}`, dataToSend);
                toast.success('Paiement modifié avec succès');
            } else {
                await api.post('/paiements', dataToSend);
                toast.success('Paiement enregistré avec succès');
            }
            closeModal();
            loadData();
            loadFactures();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deletePaiement = async (id) => {
        if (!isEditable) return;
        if (!confirm('Supprimer ce paiement ?')) return;
        try {
            await api.delete(`/paiements/${id}`);
            toast.success('Paiement supprimé');
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

    const totalMontant = data.reduce((sum, p) => sum + (p.montant || 0), 0);

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-hand-holding-usd" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Paiements
                    {data.length > 0 && (
                        <span style={{ 
                            fontSize: '14px', 
                            background: '#dcfce7', 
                            color: '#16a34a', 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            marginLeft: '12px',
                            fontWeight: '600'
                        }}>
                            {totalMontant.toLocaleString()} MAD
                        </span>
                    )}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Historique des paiements enregistrés
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                    <i className="fas fa-credit-card" style={{ marginRight: '6px' }}></i>
                    {data.length} paiement(s)
                </span>
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
                        <i className="fas fa-plus"></i> Enregistrer un paiement
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
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Facture</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Montant</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Mode</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Référence</th>
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
                                    <td style={{ padding: '12px 16px' }}>#{item.factureId}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#16a34a' }}>{item.montant || 0} MAD</td>
                                    <td style={{ padding: '12px 16px' }}>{item.datePaiement || ''}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ 
                                            padding: '2px 10px', 
                                            borderRadius: '12px', 
                                            fontSize: '11px',
                                            background: item.mode === 'virement' ? '#dbeafe' : 
                                                      item.mode === 'cheque' ? '#fef9c3' : '#f1f5f9',
                                            color: item.mode === 'virement' ? '#1e40af' : 
                                                   item.mode === 'cheque' ? '#854d0e' : '#64748b'
                                        }}>
                                            {item.mode || '-'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>{item.reference || '-'}</td>
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
                                                    onClick={() => deletePaiement(item.id)}
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
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                        <i className="fas fa-hand-holding-usd" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        Aucun paiement
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Paiement */}
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
                                {editingPaiement ? 'Modifier un paiement' : 'Enregistrer un paiement'}
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Facture</label>
                                <select name="factureId" value={formData.factureId} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required>
                                    <option value="">Sélectionner une facture</option>
                                    {factures.filter(f => f.statut !== 'payee').map(f => (
                                        <option key={f.id} value={f.id}>{f.numero || `F#${f.id}`} - {f.montantTotal || 0} MAD</option>
                                    ))}
                                    {factures.filter(f => f.statut === 'payee').map(f => (
                                        <option key={f.id} value={f.id} disabled style={{ color: '#94a3b8' }}>{f.numero || `F#${f.id}`} - Payée</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Montant (MAD)</label>
                                <input type="number" name="montant" value={formData.montant} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date de paiement</label>
                                <input type="date" name="datePaiement" value={formData.datePaiement} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Mode</label>
                                    <select name="mode" value={formData.mode} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="virement">Virement</option>
                                        <option value="cheque">Chèque</option>
                                        <option value="especes">Espèces</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Référence</label>
                                    <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
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
export default Paiements;