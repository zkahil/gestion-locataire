// src/pages/Contrats.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { jsPDF } from 'jspdf';

const Contrats = () => {
    const [data, setData] = useState([]);
    const [espaces, setEspaces] = useState([]);
    const [locataires, setLocataires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingContrat, setEditingContrat] = useState(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfContent, setPdfContent] = useState(null);
    const [formData, setFormData] = useState({
        espaceId: '',
        locataireId: '',
        statut: 'brouillon_import',
        dateSignature: '',
        dateDebut: '',
        dateFin: '',
        dureeMois: 36,
        renouvellementAuto: 0,
        delaiPreavisJours: 90,
        conditionsResiliation: '',
        montantLoyer: '',
        periodicite: 'mensuel',
        montantCharges: 0,
        montantCaution: '',
        moisCaution: 3,
        avanceVersee: '',
        modalitesPaiement: '',
        datePaiementPrevue: '',
        penalitesRetard: '',
        obligationsParticulieres: '',
        assuranceObligatoire: 0,
        clauseResponsabiliteMarchandises: 0
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [contratsRes, espacesRes, locatairesRes] = await Promise.all([
                api.get('/api/contrats'),
                api.get('/api/espaces'),
                api.get('/api/locataires')
            ]);
            setData(contratsRes.data.data || []);
            setEspaces(espacesRes.data.data || []);
            setLocataires(locatairesRes.data.data || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        }
        setLoading(false);
    };

    const openModal = (contrat = null) => {
        if (contrat) {
            setEditingContrat(contrat);
            setFormData({
                espaceId: contrat.espaceId || '',
                locataireId: contrat.locataireId || '',
                statut: contrat.statut || 'brouillon_import',
                dateSignature: contrat.dateSignature || '',
                dateDebut: contrat.dateDebut || '',
                dateFin: contrat.dateFin || '',
                dureeMois: contrat.dureeMois || 36,
                renouvellementAuto: contrat.renouvellementAuto || 0,
                delaiPreavisJours: contrat.delaiPreavisJours || 90,
                conditionsResiliation: contrat.conditionsResiliation || '',
                montantLoyer: contrat.montantLoyer || '',
                periodicite: contrat.periodicite || 'mensuel',
                montantCharges: contrat.montantCharges || 0,
                montantCaution: contrat.montantCaution || '',
                moisCaution: contrat.moisCaution || 3,
                avanceVersee: contrat.avanceVersee || '',
                modalitesPaiement: contrat.modalitesPaiement || '',
                datePaiementPrevue: contrat.datePaiementPrevue || '',
                penalitesRetard: contrat.penalitesRetard || '',
                obligationsParticulieres: contrat.obligationsParticulieres || '',
                assuranceObligatoire: contrat.assuranceObligatoire || 0,
                clauseResponsabiliteMarchandises: contrat.clauseResponsabiliteMarchandises || 0
            });
        } else {
            setEditingContrat(null);
            setFormData({
                espaceId: '',
                locataireId: '',
                statut: 'brouillon_import',
                dateSignature: '',
                dateDebut: '',
                dateFin: '',
                dureeMois: 36,
                renouvellementAuto: 0,
                delaiPreavisJours: 90,
                conditionsResiliation: '',
                montantLoyer: '',
                periodicite: 'mensuel',
                montantCharges: 0,
                montantCaution: '',
                moisCaution: 3,
                avanceVersee: '',
                modalitesPaiement: '',
                datePaiementPrevue: '',
                penalitesRetard: '',
                obligationsParticulieres: '',
                assuranceObligatoire: 0,
                clauseResponsabiliteMarchandises: 0
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingContrat(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                espaceId: parseInt(formData.espaceId),
                locataireId: parseInt(formData.locataireId),
                montantLoyer: parseFloat(formData.montantLoyer) || 0,
                montantCaution: parseFloat(formData.montantCaution) || 0,
                montantCharges: parseFloat(formData.montantCharges) || 0,
                dureeMois: parseInt(formData.dureeMois) || 36,
                moisCaution: parseInt(formData.moisCaution) || 3,
                renouvellementAuto: formData.renouvellementAuto ? 1 : 0,
                assuranceObligatoire: formData.assuranceObligatoire ? 1 : 0,
                clauseResponsabiliteMarchandises: formData.clauseResponsabiliteMarchandises ? 1 : 0,
                avanceVersee: parseFloat(formData.avanceVersee) || 0
            };

            if (editingContrat) {
                await api.put(`/contrats/${editingContrat.id}`, dataToSend);
                toast.success('Contrat modifié avec succès');
            } else {
                await api.post('/api/contrats', dataToSend);
                toast.success('Contrat créé avec succès');
            }
            closeModal();
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deleteContrat = async (id) => {
        if (!confirm('Supprimer ce contrat ?')) return;
        try {
            awaitapi.delete(`/api/contrats/${id}`);
            toast.success('Contrat supprimé');
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const resilierContrat = async (id) => {
        if (!confirm('Résilier ce contrat ?')) return;
        try {
            await api.put(`/contrats/${id}`, { statut: 'resilie' });
            toast.success('Contrat résilié');
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la résiliation');
        }
    };

    const genererPDFContrat = (id) => {
        try {
            const contrat = data.find(c => c.id === id);
            if (!contrat) return toast.error('Contrat non trouvé');
            
            const espace = espaces.find(e => e.id === contrat.espaceId);
            const locataire = locataires.find(l => l.id === contrat.locataireId);
            
            const doc = new jsPDF('p', 'mm', 'a4');
            const date = new Date().toLocaleDateString('fr-FR');

            doc.setFontSize(18);
            doc.setTextColor(26, 95, 122);
            doc.text('CONTRAT DE LOCATION', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`N° ${contrat.id} - Établi le ${date}`, 105, 28, { align: 'center' });

            doc.setDrawColor(200, 200, 200);
            doc.line(20, 32, 190, 32);

            doc.setFontSize(11);
            doc.setTextColor(50);
            let y = 42;

            const lines = [
                ['Locataire', locataire?.nomComplet || 'N/A'],
                ['Espace', espace?.designation || 'N/A'],
                ['Adresse', espace?.numero || 'N/A'],
                ['Type', espace?.type || 'N/A'],
                ['Superficie', (espace?.superficie || 0) + ' m²'],
                ['Date de signature', contrat.dateSignature || 'N/A'],
                ['Date de début', contrat.dateDebut || 'N/A'],
                ['Date de fin', contrat.dateFin || 'N/A'],
                ['Durée', (contrat.dureeMois || 0) + ' mois'],
                ['Loyer mensuel', (contrat.montantLoyer || 0) + ' MAD'],
                ['Charges', (contrat.montantCharges || 0) + ' MAD'],
                ['Caution', (contrat.montantCaution || 0) + ' MAD'],
                ['Périodicité', contrat.periodicite || 'mensuel'],
                ['Statut', contrat.statut || 'N/A'],
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
            doc.text('Fait à Casablanca, le ' + date, 105, y + 15, { align: 'center' });
            doc.text('Signature du bailleur : _________________', 105, y + 25, { align: 'center' });
            doc.text('Signature du locataire : _________________', 105, y + 35, { align: 'center' });

            doc.save(`contrat_${contrat.id}.pdf`);
            toast.success('PDF généré avec succès');
        } catch (error) {
            toast.error('Erreur lors de la génération du PDF');
            console.error(error);
        }
    };

    const apercuPDFContrat = (id) => {
        try {
            const contrat = data.find(c => c.id === id);
            if (!contrat) return toast.error('Contrat non trouvé');
            
            const espace = espaces.find(e => e.id === contrat.espaceId);
            const locataire = locataires.find(l => l.id === contrat.locataireId);
            const date = new Date().toLocaleDateString('fr-FR');

            setPdfContent({
                contrat,
                espace,
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

    const getEspaceName = (id) => {
        const espace = espaces.find(e => e.id === id);
        return espace?.designation || 'N/A';
    };

    const getLocataireName = (id) => {
        const locataire = locataires.find(l => l.id === id);
        return locataire?.nomComplet || 'N/A';
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
                    <i className="fas fa-file-signature" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Contrats
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Gestion des contrats de location
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                    <i className="fas fa-file-signature" style={{ marginRight: '6px' }}></i>
                    {data.length} contrat(s)
                </span>
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
                    <i className="fas fa-plus"></i> Nouveau contrat
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
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>#</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Espace</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Locataire</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Début</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Fin</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Loyer</th>
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
                                    <td style={{ padding: '12px 16px' }}>#{item.id}</td>
                                    <td style={{ padding: '12px 16px' }}>{getEspaceName(item.espaceId)}</td>
                                    <td style={{ padding: '12px 16px' }}>{getLocataireName(item.locataireId)}</td>
                                    <td style={{ padding: '12px 16px' }}>{item.dateDebut || ''}</td>
                                    <td style={{ padding: '12px 16px' }}>{item.dateFin || ''}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{item.montantLoyer || 0} MAD</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600',
                                            background: item.statut === 'actif' ? '#dcfce7' : 
                                                      item.statut === 'resilie' ? '#fee2e2' : 
                                                      item.statut === 'en_attente_validation' ? '#fef9c3' : '#f1f5f9',
                                            color: item.statut === 'actif' ? '#166534' : 
                                                   item.statut === 'resilie' ? '#991b1b' : 
                                                   item.statut === 'en_attente_validation' ? '#854d0e' : '#64748b'
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
                                            onClick={() => genererPDFContrat(item.id)}
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
                                            onClick={() => apercuPDFContrat(item.id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        {item.statut === 'actif' && (
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
                                                    marginRight: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => resilierContrat(item.id)}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        )}
                                        {item.statut !== 'actif' && (
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
                                                onClick={() => deleteContrat(item.id)}
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
                                    <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                        <i className="fas fa-file-signature" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        Aucun contrat
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Contrat */}
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
                        maxWidth: '800px', 
                        width: '100%', 
                        maxHeight: '90vh', 
                        overflowY: 'auto', 
                        padding: '24px', 
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.25s ease'
                    }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                                {editingContrat ? 'Modifier un contrat' : 'Nouveau contrat'}
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
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Espace</label>
                                    <select name="espaceId" value={formData.espaceId} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required>
                                        <option value="">Sélectionner un espace</option>
                                        {espaces.filter(e => e.statut === 'disponible' || e.id === editingContrat?.espaceId).map(e => (
                                            <option key={e.id} value={e.id}>{e.numero} - {e.designation}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Locataire</label>
                                    <select name="locataireId" value={formData.locataireId} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required>
                                        <option value="">Sélectionner un locataire</option>
                                        {locataires.map(l => (
                                            <option key={l.id} value={l.id}>{l.nomComplet}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date signature</label>
                                    <input type="date" name="dateSignature" value={formData.dateSignature} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date début</label>
                                    <input type="date" name="dateDebut" value={formData.dateDebut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date fin</label>
                                    <input type="date" name="dateFin" value={formData.dateFin} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Durée (mois)</label>
                                    <input type="number" name="dureeMois" value={formData.dureeMois} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Périodicité</label>
                                    <select name="periodicite" value={formData.periodicite} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="mensuel">Mensuel</option>
                                        <option value="trimestriel">Trimestriel</option>
                                        <option value="annuel">Annuel</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Délai préavis (jours)</label>
                                    <input type="number" name="delaiPreavisJours" value={formData.delaiPreavisJours} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Loyer (MAD)</label>
                                    <input type="number" name="montantLoyer" value={formData.montantLoyer} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Charges (MAD)</label>
                                    <input type="number" name="montantCharges" value={formData.montantCharges} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Caution (MAD)</label>
                                    <input type="number" name="montantCaution" value={formData.montantCaution} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Mois caution</label>
                                    <input type="number" name="moisCaution" value={formData.moisCaution} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Statut</label>
                                <select name="statut" value={formData.statut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                    <option value="brouillon_import">Brouillon</option>
                                    <option value="en_attente_validation">En attente validation</option>
                                    <option value="actif">Actif</option>
                                    <option value="expire">Expiré</option>
                                    <option value="resilie">Résilié</option>
                                    <option value="renouvele">Renouvelé</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Modalités de paiement</label>
                                <input type="text" name="modalitesPaiement" value={formData.modalitesPaiement} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date paiement prévue</label>
                                <input type="date" name="datePaiementPrevue" value={formData.datePaiementPrevue} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Pénalités de retard</label>
                                <input type="text" name="penalitesRetard" value={formData.penalitesRetard} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Obligations particulières</label>
                                <textarea name="obligationsParticulieres" value={formData.obligationsParticulieres} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '50px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Conditions de résiliation</label>
                                <textarea name="conditionsResiliation" value={formData.conditionsResiliation} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '50px' }} />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        <input type="checkbox" name="renouvellementAuto" checked={formData.renouvellementAuto === 1} onChange={handleInputChange} style={{ marginRight: '4px' }} />
                                        Renouvellement automatique
                                    </label>
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        <input type="checkbox" name="assuranceObligatoire" checked={formData.assuranceObligatoire === 1} onChange={handleInputChange} style={{ marginRight: '4px' }} />
                                        Assurance obligatoire
                                    </label>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                    <input type="checkbox" name="clauseResponsabiliteMarchandises" checked={formData.clauseResponsabiliteMarchandises === 1} onChange={handleInputChange} style={{ marginRight: '4px' }} />
                                    Clause responsabilité marchandises
                                </label>
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

            {/* Modal Aperçu PDF */}
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
                                Aperçu du contrat #{pdfContent.contrat.id}
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
                                    fontSize: '18px', 
                                    fontWeight: '700', 
                                    textAlign: 'center', 
                                    color: '#1a5f7a', 
                                    marginBottom: '8px'
                                }}>
                                    CONTRAT DE LOCATION
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                    N° {pdfContent.contrat.id} - Établi le {pdfContent.date}
                                </div>
                                <hr style={{ borderColor: '#e2e8f0', marginBottom: '12px' }} />
                                {[
                                    ['Locataire', pdfContent.locataire?.nomComplet || 'N/A'],
                                    ['Espace', pdfContent.espace?.designation || 'N/A'],
                                    ['Adresse', pdfContent.espace?.numero || 'N/A'],
                                    ['Type', pdfContent.espace?.type || 'N/A'],
                                    ['Superficie', (pdfContent.espace?.superficie || 0) + ' m²'],
                                    ['Date de signature', pdfContent.contrat.dateSignature || 'N/A'],
                                    ['Date de début', pdfContent.contrat.dateDebut || 'N/A'],
                                    ['Date de fin', pdfContent.contrat.dateFin || 'N/A'],
                                    ['Durée', (pdfContent.contrat.dureeMois || 0) + ' mois'],
                                    ['Loyer mensuel', (pdfContent.contrat.montantLoyer || 0) + ' MAD'],
                                    ['Charges', (pdfContent.contrat.montantCharges || 0) + ' MAD'],
                                    ['Caution', (pdfContent.contrat.montantCaution || 0) + ' MAD'],
                                    ['Statut', pdfContent.contrat.statut || 'N/A'],
                                ].map(([label, value]) => (
                                    <div key={label} className="pdf-line" style={{ display: 'flex', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span className="label" style={{ fontWeight: '600', minWidth: '140px', color: '#475569' }}>{label}</span>
                                        <span className="value" style={{ flex: 1 }}>{value}</span>
                                    </div>
                                ))}
                                <div className="pdf-signature" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                                    Fait à Casablanca, le {pdfContent.date}<br />
                                    Signature du bailleur : _________________<br />
                                    Signature du locataire : _________________
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
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                Fermer
                            </button>
                            <button className="btn btn-gold" onClick={() => { closePdfModal(); genererPDFContrat(pdfContent.contrat.id); }} style={{ 
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
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#b8942e'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#d4a843'}>
                                <i className="fas fa-download"></i> Télécharger
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Contrats;