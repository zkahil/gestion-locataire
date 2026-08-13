// src/pages/Cautions.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Cautions = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState([]);
    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCaution, setEditingCaution] = useState(null);
    const [formData, setFormData] = useState({
        contratId: '',
        montantAttendu: '',
        montantRecu: 0,
        dateVersement: '',
        statut: 'attendue',
        modeReglement: 'virement',
        conditionsRemboursement: '',
        conditionsRetenue: ''
    });

    const isEditable = user?.role === 'admin' || user?.role === 'gestionnaire';

    useEffect(() => {
        loadData();
        loadContrats();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.get('/cautions');
            setData(res.data.data || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        }
        setLoading(false);
    };

    const loadContrats = async () => {
        try {
            const res = await api.get('/contrats');
            setContrats(res.data.data || []);
        } catch (error) {
            console.error('Erreur chargement contrats');
        }
    };

    const openModal = (caution = null) => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour modifier');
            return;
        }
        if (caution) {
            setEditingCaution(caution);
            setFormData({
                contratId: caution.contratId || '',
                montantAttendu: caution.montantAttendu || '',
                montantRecu: caution.montantRecu || 0,
                dateVersement: caution.dateVersement || '',
                statut: caution.statut || 'attendue',
                modeReglement: caution.modeReglement || 'virement',
                conditionsRemboursement: caution.conditionsRemboursement || '',
                conditionsRetenue: caution.conditionsRetenue || ''
            });
        } else {
            setEditingCaution(null);
            setFormData({
                contratId: '',
                montantAttendu: '',
                montantRecu: 0,
                dateVersement: '',
                statut: 'attendue',
                modeReglement: 'virement',
                conditionsRemboursement: '',
                conditionsRetenue: ''
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCaution(null);
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
                contratId: parseInt(formData.contratId),
                montantAttendu: parseFloat(formData.montantAttendu) || 0,
                montantRecu: parseFloat(formData.montantRecu) || 0
            };

            if (editingCaution) {
                await api.put(`/cautions/${editingCaution.id}`, dataToSend);
                toast.success('Caution modifiée avec succès');
            } else {
                await api.post('/cautions', dataToSend);
                toast.success('Caution ajoutée avec succès');
            }
            closeModal();
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deleteCaution = async (id) => {
        if (!isEditable) return;
        if (!confirm('Supprimer cette caution ?')) return;
        try {
            await api.delete(`/cautions/${id}`);
            toast.success('Caution supprimée');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const getStatusColor = (statut) => {
        const colors = {
            recue: '#16a34a',
            attendue: '#eab308',
            partiellement_recue: '#3b82f6',
            remboursee: '#94a3b8',
            retenue: '#ef4444'
        };
        return colors[statut] || '#94a3b8';
    };

    const getStatusLabel = (statut) => {
        const labels = {
            recue: 'Reçue',
            attendue: 'Attendue',
            partiellement_recue: 'Partiellement reçue',
            remboursee: 'Remboursée',
            retenue: 'Retenue'
        };
        return labels[statut] || statut;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const totalAttendu = data.reduce((sum, c) => sum + (c.montantAttendu || 0), 0);
    const totalRecu = data.reduce((sum, c) => sum + (c.montantRecu || 0), 0);

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-shield-alt" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Cautions
                    {data.length > 0 && (
                        <span style={{ 
                            fontSize: '14px', 
                            background: '#dbeafe', 
                            color: '#1e40af', 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            marginLeft: '12px',
                            fontWeight: '600'
                        }}>
                            {totalRecu.toLocaleString()} / {totalAttendu.toLocaleString()} MAD
                        </span>
                    )}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Gestion des cautions et dépôts de garantie
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                        <i className="fas fa-shield-alt" style={{ marginRight: '6px' }}></i>
                        {data.length} caution(s)
                    </span>
                    <span style={{ fontSize: '13px', color: '#16a34a' }}>
                        <i className="fas fa-check-circle"></i> {data.filter(c => c.statut === 'recue').length} reçues
                    </span>
                    <span style={{ fontSize: '13px', color: '#eab308' }}>
                        <i className="fas fa-clock"></i> {data.filter(c => c.statut === 'attendue').length} attendues
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
                        <i className="fas fa-plus"></i> Ajouter une caution
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
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Contrat</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Attendu</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Reçu</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Statut</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Versement</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => {
                                const statusColor = getStatusColor(item.statut);
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>#{item.id}</td>
                                        <td style={{ padding: '12px 16px' }}>#{item.contratId}</td>
                                        <td style={{ padding: '12px 16px' }}>{item.montantAttendu || 0} MAD</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: item.montantRecu >= item.montantAttendu ? '#16a34a' : '#eab308' }}>
                                            {item.montantRecu || 0} MAD
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '12px', 
                                                fontWeight: '600',
                                                background: statusColor === '#16a34a' ? '#dcfce7' : 
                                                          statusColor === '#eab308' ? '#fef9c3' : 
                                                          statusColor === '#ef4444' ? '#fee2e2' : '#f1f5f9',
                                                color: statusColor
                                            }}>
                                                {getStatusLabel(item.statut)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{item.dateVersement || ''}</td>
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
                                                        onClick={() => deleteCaution(item.id)}
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
                                );
                            })}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                        <i className="fas fa-shield-alt" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        Aucune caution
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Caution */}
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
                                {editingCaution ? 'Modifier une caution' : 'Ajouter une caution'}
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Contrat</label>
                                <select name="contratId" value={formData.contratId} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required>
                                    <option value="">Sélectionner un contrat</option>
                                    {contrats.map(c => (
                                        <option key={c.id} value={c.id}>#{c.id} - {c.montantLoyer || 0} MAD/mois</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Montant attendu (MAD)</label>
                                    <input type="number" name="montantAttendu" value={formData.montantAttendu} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Montant reçu (MAD)</label>
                                    <input type="number" name="montantRecu" value={formData.montantRecu} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date de versement</label>
                                    <input type="date" name="dateVersement" value={formData.dateVersement} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Statut</label>
                                    <select name="statut" value={formData.statut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="attendue">Attendue</option>
                                        <option value="recue">Reçue</option>
                                        <option value="partiellement_recue">Partiellement reçue</option>
                                        <option value="remboursee">Remboursée</option>
                                        <option value="retenue">Retenue</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Mode de règlement</label>
                                <select name="modeReglement" value={formData.modeReglement} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                    <option value="virement">Virement</option>
                                    <option value="cheque">Chèque</option>
                                    <option value="especes">Espèces</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Conditions de remboursement</label>
                                <textarea name="conditionsRemboursement" value={formData.conditionsRemboursement} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '50px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Conditions de retenue</label>
                                <textarea name="conditionsRetenue" value={formData.conditionsRetenue} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '50px' }} />
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
export default Cautions;