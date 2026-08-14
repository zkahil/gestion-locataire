// src/pages/Factures.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { jsPDF } from 'jspdf';

const Factures = () => {
    const [data, setData] = useState([]);
    const [contrats, setContrats] = useState([]);
    const [locataires, setLocataires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFacture, setEditingFacture] = useState(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfContent, setPdfContent] = useState(null);
    const [formData, setFormData] = useState({
        contratId: '',
        periodeDebut: '',
        periodeFin: '',
        montantLoyer: '',
        montantCharges: 0,
        dateEcheance: '',
        statut: 'impayee'
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [facturesRes, contratsRes, locatairesRes] = await Promise.all([
                api.get('/api/factures'),
                api.get('/api/contrats'),
                api.get('/api/locataires')
            ]);
            setData(facturesRes.data.data || []);
            setContrats(contratsRes.data.data || []);
            setLocataires(locatairesRes.data.data || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        }
        setLoading(false);
    };

    const openModal = (facture = null) => {
        if (facture) {
            setEditingFacture(facture);
            setFormData({
                contratId: facture.contratId || '',
                periodeDebut: facture.periodeDebut || '',
                periodeFin: facture.periodeFin || '',
                montantLoyer: facture.montantLoyer || '',
                montantCharges: facture.montantCharges || 0,
                dateEcheance: facture.dateEcheance || '',
                statut: facture.statut || 'impayee'
            });
        } else {
            setEditingFacture(null);
            setFormData({
                contratId: '',
                periodeDebut: '',
                periodeFin: '',
                montantLoyer: '',
                montantCharges: 0,
                dateEcheance: '',
                statut: 'impayee'
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingFacture(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                contratId: parseInt(formData.contratId),
                montantLoyer: parseFloat(formData.montantLoyer) || 0,
                montantCharges: parseFloat(formData.montantCharges) || 0,
                montantTotal: (parseFloat(formData.montantLoyer) || 0) + (parseFloat(formData.montantCharges) || 0)
            };

            if (editingFacture) {
                await api.put(`/api/factures/${editingFacture.id}`, dataToSend);
                toast.success('Facture modifiée avec succès');
            } else {
                // Générer un numéro unique
                const numero = 'F' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);
                await api.post('/api/factures', { ...dataToSend, numero });
                toast.success('Facture générée avec succès');
            }
            closeModal();
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deleteFacture = async (id) => {
        if (!confirm('Supprimer cette facture ?')) return;
        try {
            awaitapi.delete(`/api/factures/${id}`);
            toast.success('Facture supprimée');
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const genererPDFFacture = (id) => {
        try {
            const facture = data.find(f => f.id === id);
            if (!facture) return toast.error('Facture non trouvée');
            
            const contrat = contrats.find(c => c.id === facture.contratId);
            const locataire = locataires.find(l => l.id === facture.locataireId);
            
            const doc = new jsPDF('p', 'mm', 'a4');
            const date = new Date().toLocaleDateString('fr-FR');

            doc.setFontSize(20);
            doc.setTextColor(26, 95, 122);
            doc.text('FACTURE', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`N° ${facture.numero} - ${date}`, 105, 28, { align: 'center' });

            doc.setDrawColor(200, 200, 200);
            doc.line(20, 32, 190, 32);

            doc.setFontSize(11);
            doc.setTextColor(50);
            let y = 42;

            const lines = [
                ['Client', locataire?.nomComplet || 'N/A'],
                ['Contrat', '#' + (contrat?.id || 'N/A')],
                ['Période', facture.periodeDebut + ' → ' + facture.periodeFin],
                ['Loyer', facture.montantLoyer + ' MAD'],
                ['Charges', facture.montantCharges + ' MAD'],
                ['Total TTC', facture.montantTotal + ' MAD'],
                ['Date d\'échéance', facture.dateEcheance || 'N/A'],
                ['Statut', facture.statut || 'N/A'],
            ];

            lines.forEach(([label, value]) => {
                doc.setFont('helvetica', 'bold');
                doc.text(label + ' :', 25, y);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), 65, y);
                y += 8;
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });

            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text('Merci de régler cette facture avant la date d\'échéance.', 105, y + 20, { align: 'center' });
            doc.text('Paiement par virement bancaire ou chèque.', 105, y + 28, { align: 'center' });

            doc.save(`facture_${facture.numero}.pdf`);
            toast.success('PDF généré avec succès');
        } catch (error) {
            toast.error('Erreur lors de la génération du PDF');
            console.error(error);
        }
    };

    const apercuPDFFacture = (id) => {
        try {
            const facture = data.find(f => f.id === id);
            if (!facture) return toast.error('Facture non trouvée');
            
            const contrat = contrats.find(c => c.id === facture.contratId);
            const locataire = locataires.find(l => l.id === facture.locataireId);
            const date = new Date().toLocaleDateString('fr-FR');

            setPdfContent({
                facture,
                contrat,
                locataire,
                date
            });
            setPdfModalOpen(true);
        } catch (error) {
            toast.error('Erreur lors de l\'aperçu');
        }
    };

    const closePdfModal = () => {
        setPdfModalOpen(false);
        setPdfContent(null);
    };

    const getContratInfo = (id) => {
        const contrat = contrats.find(c => c.id === id);
        return contrat ? `#${contrat.id}` : 'N/A';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const impayees = data.filter(f => f.statut === 'impayee').length;

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-receipt" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Factures
                    {impayees > 0 && (
                        <span style={{ 
                            fontSize: '14px', 
                            background: '#fef2f2', 
                            color: '#ef4444', 
                            padding: '4px 12px', 
                            borderRadius: '20px',
                            marginLeft: '12px',
                            fontWeight: '600'
                        }}>
                            {impayees} impayée(s)
                        </span>
                    )}
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Gestion des factures et des paiements
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                        <i className="fas fa-file-invoice" style={{ marginRight: '6px' }}></i>
                        {data.length} facture(s)
                    </span>
                    <span style={{ fontSize: '13px', color: '#16a34a' }}>
                        <i className="fas fa-check-circle"></i> {data.filter(f => f.statut === 'payee').length} payées
                    </span>
                    <span style={{ fontSize: '13px', color: '#ef4444' }}>
                        <i className="fas fa-exclamation-circle"></i> {impayees} impayées
                    </span>
                </div>
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
                    <i className="fas fa-plus"></i> Générer une facture
                </button>
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
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>N°</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Contrat</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Période</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Échéance</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Statut</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{item.numero || `F#${item.id}`}</td>
                                    <td style={{ padding: '12px 16px' }}>{getContratInfo(item.contratId)}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{item.periodeDebut || ''} → {item.periodeFin || ''}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>{item.montantTotal || 0} MAD</td>
                                    <td style={{ padding: '12px 16px' }}>{item.dateEcheance || ''}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600',
                                            background: item.statut === 'payee' ? '#dcfce7' : 
                                                      item.statut === 'impayee' ? '#fee2e2' : 
                                                      item.statut === 'en_retard' ? '#fef9c3' : '#f1f5f9',
                                            color: item.statut === 'payee' ? '#166534' : 
                                                   item.statut === 'impayee' ? '#991b1b' : 
                                                   item.statut === 'en_retard' ? '#854d0e' : '#64748b'
                                        }}>
                                            {item.statut}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
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
                                            className="btn btn-xs btn-gold" 
                                            style={{ 
                                                padding: '4px 10px', 
                                                fontSize: '12px', 
                                                background: '#d4a843', 
                                                color: '#fff', 
                                                border: 'none', 
                                                borderRadius: '6px', 
                                                cursor: 'pointer',
                                                marginRight: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => genererPDFFacture(item.id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#b8942e'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#d4a843'}
                                        >
                                            <i className="fas fa-file-pdf"></i>
                                        </button>
                                        <button 
                                            className="btn btn-xs btn-info" 
                                            style={{ 
                                                padding: '4px 10px', 
                                                fontSize: '12px', 
                                                background: '#3b82f6', 
                                                color: '#fff', 
                                                border: 'none', 
                                                borderRadius: '6px', 
                                                cursor: 'pointer',
                                                marginRight: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => apercuPDFFacture(item.id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        {item.statut === 'impayee' && (
                                            <button 
                                                className="btn btn-xs btn-success" 
                                                style={{ 
                                                    padding: '4px 10px', 
                                                    fontSize: '12px', 
                                                    background: '#16a34a', 
                                                    color: '#fff', 
                                                    border: 'none', 
                                                    borderRadius: '6px', 
                                                    cursor: 'pointer',
                                                    marginRight: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => toast.success('Paiement enregistré')}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                                            >
                                                <i className="fas fa-coins"></i>
                                            </button>
                                        )}
                                        {item.statut !== 'payee' && (
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
                                                onClick={() => deleteFacture(item.id)}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                        <i className="fas fa-receipt" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        Aucune facture
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Facture */}
            {modalOpen && (
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
                                {editingFacture ? 'Modifier une facture' : 'Générer une facture'}
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
                                        <option key={c.id} value={c.id}>#{c.id} - {c.montantLoyer} MAD/mois</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Période début</label>
                                    <input type="date" name="periodeDebut" value={formData.periodeDebut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Période fin</label>
                                    <input type="date" name="periodeFin" value={formData.periodeFin} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Loyer (MAD)</label>
                                    <input type="number" name="montantLoyer" value={formData.montantLoyer} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Charges (MAD)</label>
                                    <input type="number" name="montantCharges" value={formData.montantCharges} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date d'échéance</label>
                                <input type="date" name="dateEcheance" value={formData.dateEcheance} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Statut</label>
                                <select name="statut" value={formData.statut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                    <option value="payee">Payée</option>
                                    <option value="impayee">Impayée</option>
                                    <option value="en_retard">En retard</option>
                                    <option value="annulee">Annulée</option>
                                    <option value="partiellement_payee">Partiellement payée</option>
                                </select>
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
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
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
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#0f3b5e'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#1a5f7a'}>
                                    <i className="fas fa-save"></i> Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Aperçu PDF Facture */}
            {pdfModalOpen && pdfContent && (
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
                                <i className="fas fa-file-pdf" style={{ color: '#ef4444', marginRight: '8px' }}></i>
                                Aperçu facture {pdfContent.facture.numero}
                            </h2>
                            <button className="close" onClick={closePdfModal} style={{ 
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
                        <div className="pdf-viewer" style={{ 
                            background: '#f8fafc', 
                            borderRadius: '8px', 
                            padding: '16px', 
                            border: '1px solid #e2e8f0', 
                            maxHeight: '500px', 
                            overflowY: 'auto'
                        }}>
                            <div className="pdf-page" style={{ 
                                background: '#fff', 
                                borderRadius: '8px', 
                                padding: '20px', 
                                marginBottom: '8px', 
                                border: '1px solid #e2e8f0', 
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
                                fontSize: '13px', 
                                lineHeight: '1.8', 
                                color: '#334155'
                            }}>
                                <div className="pdf-title" style={{ 
                                    fontSize: '20px', 
                                    fontWeight: '700', 
                                    textAlign: 'center', 
                                    color: '#1a5f7a', 
                                    marginBottom: '8px'
                                }}>
                                    FACTURE
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                    N° {pdfContent.facture.numero} - Établi le {pdfContent.date}
                                </div>
                                <hr style={{ borderColor: '#e2e8f0', marginBottom: '12px' }} />
                                {[
                                    ['Client', pdfContent.locataire?.nomComplet || 'N/A'],
                                    ['Contrat', '#' + (pdfContent.contrat?.id || 'N/A')],
                                    ['Période', pdfContent.facture.periodeDebut + ' → ' + pdfContent.facture.periodeFin],
                                    ['Loyer', pdfContent.facture.montantLoyer + ' MAD'],
                                    ['Charges', pdfContent.facture.montantCharges + ' MAD'],
                                    ['Total TTC', pdfContent.facture.montantTotal + ' MAD'],
                                    ['Date d\'échéance', pdfContent.facture.dateEcheance || 'N/A'],
                                    ['Statut', pdfContent.facture.statut || 'N/A'],
                                ].map(([label, value]) => (
                                    <div key={label} className="pdf-line" style={{ display: 'flex', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span className="label" style={{ fontWeight: '600', minWidth: '140px', color: '#475569' }}>{label}</span>
                                        <span className="value" style={{ flex: 1 }}>{value}</span>
                                    </div>
                                ))}
                                <div className="pdf-signature" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                                    Merci de régler cette facture avant la date d'échéance.<br />
                                    Paiement par virement bancaire ou chèque.
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                            <button className="btn btn-outline" onClick={closePdfModal} style={{ 
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
                                Fermer
                            </button>
                            <button className="btn btn-gold" onClick={() => { closePdfModal(); genererPDFFacture(pdfContent.facture.id); }} style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '8px 20px', 
                                borderRadius: '8px', 
                                fontWeight: '500', 
                                fontSize: '14px', 
                                border: 'none', 
                                cursor: 'pointer', 
                                background: '#d4a843', 
                                color: '#fff',
                                transition: 'all 0.2s'
                            }}>
                                <i className="fas fa-download"></i> Télécharger
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Factures;