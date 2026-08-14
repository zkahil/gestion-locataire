// src/pages/Contrats.js - Version améliorée avec PDF professionnel

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import useAuthStore from '../store/authStore';

// Configuration du PDF (personnalisable)
const PDF_CONFIG = {
    // Logo (mettre l'URL de votre logo ou null)
    logo: null, // 'https://votre-site.com/logo.png',
    // Couleurs
    primaryColor: '#1a5f7a',
    secondaryColor: '#d4a843',
    // En-tête
    header: {
        title: 'CONTRAT DE LOCATION',
        subtitle: 'Gestion Locataire',
        address: 'Casablanca, Maroc',
        phone: '+212 5XX-XXXXXX',
        email: 'contact@votre-site.com'
    },
    // Pied de page
    footer: {
        text: 'Ce contrat est régi par la loi marocaine. Toute reproduction est interdite.',
        showPageNumbers: true
    }
};

const Contrats = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState([]);
    const [espaces, setEspaces] = useState([]);
    const [locataires, setLocataires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingContrat, setEditingContrat] = useState(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfContent, setPdfContent] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
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

    const isEditable = user?.role === 'admin' || user?.role === 'gestionnaire';

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);
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
            console.error('❌ Erreur chargement:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.espaceId) errors.espaceId = 'L\'espace est requis';
        if (!formData.locataireId) errors.locataireId = 'Le locataire est requis';
        if (!formData.dateDebut) errors.dateDebut = 'La date de début est requise';
        if (!formData.dateFin) errors.dateFin = 'La date de fin est requise';
        if (!formData.montantLoyer || parseFloat(formData.montantLoyer) <= 0) {
            errors.montantLoyer = 'Le loyer doit être supérieur à 0';
        }
        if (!formData.montantCaution || parseFloat(formData.montantCaution) <= 0) {
            errors.montantCaution = 'La caution est requise';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openModal = (contrat = null) => {
        setFormErrors({});
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
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Veuillez corriger les erreurs du formulaire');
            return;
        }

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
                await api.put(`/api/contrats/${editingContrat.id}`, dataToSend);
                toast.success('✅ Contrat modifié avec succès');
            } else {
                await api.post('/api/contrats', dataToSend);
                toast.success('✅ Contrat créé avec succès');
            }
            closeModal();
            loadAllData();
        } catch (error) {
            console.error('❌ Erreur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deleteContrat = async (id) => {
        if (deletingId) return;
        const contrat = data.find(c => c.id === id);
        if (!window.confirm(`⚠️ Supprimer le contrat #${id} ?\n\nCette action est irréversible !`)) return;
        
        setDeletingId(id);
        try {
            await api.delete(`/api/contrats/${id}`);
            toast.success('✅ Contrat supprimé avec succès');
            loadAllData();
        } catch (error) {
            console.error('❌ Erreur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setDeletingId(null);
        }
    };

    const resilierContrat = async (id) => {
        if (actionInProgress) return;
        const contrat = data.find(c => c.id === id);
        if (!window.confirm(`⚠️ Résilier le contrat #${id} ?\n\nLocataire: ${getLocataireName(contrat?.locataireId)}`)) return;
        
        setActionInProgress(true);
        try {
            await api.put(`/api/contrats/${id}`, { statut: 'resilie' });
            toast.success('✅ Contrat résilié avec succès');
            loadAllData();
        } catch (error) {
            console.error('❌ Erreur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la résiliation');
        } finally {
            setActionInProgress(false);
        }
    };

    // Fonction améliorée de génération PDF avec logo, en-tête et pied de page
    const genererPDFContrat = (id) => {
        try {
            const contrat = data.find(c => c.id === id);
            if (!contrat) return toast.error('Contrat non trouvé');
            
            const espace = espaces.find(e => e.id === contrat.espaceId);
            const locataire = locataires.find(l => l.id === contrat.locataireId);
            
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const date = new Date().toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            // ===== EN-TÊTE =====
            // Ligne décorative
            doc.setDrawColor(26, 95, 122);
            doc.setLineWidth(2);
            doc.line(margin, 15, pageWidth - margin, 15);
            
            // Logo (si configuré)
            if (PDF_CONFIG.logo) {
                try {
                    doc.addImage(PDF_CONFIG.logo, 'PNG', margin, 22, 30, 30);
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(PDF_CONFIG.header.subtitle || '', margin + 32, 28);
                    doc.text(PDF_CONFIG.header.address || '', margin + 32, 34);
                    doc.text(PDF_CONFIG.header.phone || '', margin + 32, 40);
                } catch (e) {
                    // Si le logo ne se charge pas, afficher le texte uniquement
                    doc.setFontSize(14);
                    doc.setTextColor(26, 95, 122);
                    doc.text(PDF_CONFIG.header.title || 'CONTRAT DE LOCATION', pageWidth / 2, 35, { align: 'center' });
                }
            } else {
                // Pas de logo, afficher le titre
                doc.setFontSize(14);
                doc.setTextColor(26, 95, 122);
                doc.text(PDF_CONFIG.header.title || 'CONTRAT DE LOCATION', pageWidth / 2, 35, { align: 'center' });
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(PDF_CONFIG.header.subtitle || '', pageWidth / 2, 42, { align: 'center' });
                doc.text(PDF_CONFIG.header.address || '', pageWidth / 2, 48, { align: 'center' });
            }

            // Numéro de contrat
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`N° ${contrat.id}`, pageWidth - margin, 30, { align: 'right' });
            doc.text(`Établi le ${date}`, pageWidth - margin, 36, { align: 'right' });

            // Ligne décorative sous l'en-tête
            doc.setDrawColor(212, 168, 67);
            doc.setLineWidth(0.5);
            doc.line(margin, 50, pageWidth - margin, 50);

            // ===== CORPS =====
            let y = 60;

            // Titre du contrat
            doc.setFontSize(16);
            doc.setTextColor(26, 95, 122);
            doc.setFont('helvetica', 'bold');
            doc.text('CONTRAT DE LOCATION', pageWidth / 2, y, { align: 'center' });
            y += 10;

            // Informations
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);

            const infoLines = [
                ['Locataire', locataire?.nomComplet || 'N/A'],
                ['Espace', espace?.designation || 'N/A'],
                ['Adresse', espace?.numero || 'N/A'],
                ['Type', espace?.type || 'N/A'],
                ['Superficie', (espace?.superficie || 0) + ' m²'],
                ['Date de signature', contrat.dateSignature || 'N/A'],
                ['Date de début', contrat.dateDebut || 'N/A'],
                ['Date de fin', contrat.dateFin || 'N/A'],
                ['Durée', (contrat.dureeMois || 0) + ' mois'],
                ['Périodicité', contrat.periodicite || 'mensuel'],
                ['Délai préavis', (contrat.delaiPreavisJours || 90) + ' jours'],
            ];

            // Colonnes pour les informations
            const col1Width = 60;
            const col2Width = pageWidth - margin * 2 - col1Width - 10;

            infoLines.forEach(([label, value]) => {
                // Vérifier si on a besoin d'une nouvelle page
                if (y > pageHeight - 60) {
                    doc.addPage();
                    y = 20;
                    
                    // Reproduire l'en-tête sur les nouvelles pages
                    doc.setDrawColor(26, 95, 122);
                    doc.setLineWidth(1);
                    doc.line(margin, 10, pageWidth - margin, 10);
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(`Contrat #${contrat.id} - Suite`, pageWidth / 2, 18, { align: 'center' });
                    doc.setDrawColor(212, 168, 67);
                    doc.setLineWidth(0.5);
                    doc.line(margin, 22, pageWidth - margin, 22);
                    y = 30;
                }

                doc.setFont('helvetica', 'bold');
                doc.text(label + ' :', margin, y);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), margin + col1Width, y);
                y += 8;
            });

            // Section Montants
            if (y > pageHeight - 70) {
                doc.addPage();
                y = 20;
                doc.setDrawColor(26, 95, 122);
                doc.setLineWidth(1);
                doc.line(margin, 10, pageWidth - margin, 10);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Contrat #${contrat.id} - Suite`, pageWidth / 2, 18, { align: 'center' });
                doc.setDrawColor(212, 168, 67);
                doc.setLineWidth(0.5);
                doc.line(margin, 22, pageWidth - margin, 22);
                y = 30;
            }

            // Encadré des montants
            const montantX = margin + 20;
            const montantY = y;
            const montantWidth = pageWidth - margin * 2 - 40;
            const montantHeight = 80;

            doc.setDrawColor(26, 95, 122);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(montantX, montantY, montantWidth, montantHeight, 3, 3, 'FD');
            
            let my = montantY + 8;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 95, 122);
            doc.text('MONTANTS FINANCIERS', montantX + 10, my);
            my += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);
            const montants = [
                ['Loyer mensuel', (contrat.montantLoyer || 0) + ' MAD'],
                ['Charges', (contrat.montantCharges || 0) + ' MAD'],
                ['Total mensuel', ((contrat.montantLoyer || 0) + (contrat.montantCharges || 0)) + ' MAD'],
                ['Caution', (contrat.montantCaution || 0) + ' MAD'],
                ['Mois caution', (contrat.moisCaution || 3)],
                ['Avance versée', (contrat.avanceVersee || 0) + ' MAD'],
            ];
            montants.forEach(([label, value]) => {
                doc.setFont('helvetica', 'bold');
                doc.text(label + ' :', montantX + 10, my);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), montantX + 70, my);
                my += 8;
            });

            y = montantY + montantHeight + 12;

            // Section conditions
            if (y > pageHeight - 60) {
                doc.addPage();
                y = 20;
                doc.setDrawColor(26, 95, 122);
                doc.setLineWidth(1);
                doc.line(margin, 10, pageWidth - margin, 10);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Contrat #${contrat.id} - Suite`, pageWidth / 2, 18, { align: 'center' });
                doc.setDrawColor(212, 168, 67);
                doc.setLineWidth(0.5);
                doc.line(margin, 22, pageWidth - margin, 22);
                y = 30;
            }

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 95, 122);
            doc.text('CONDITIONS PARTICULIÈRES', margin, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);
            doc.setFontSize(9);

            const conditions = [
                ['Modalités de paiement', contrat.modalitesPaiement || 'Non spécifié'],
                ['Pénalités de retard', contrat.penalitesRetard || 'Non spécifié'],
                ['Renouvellement automatique', contrat.renouvellementAuto ? 'Oui' : 'Non'],
                ['Assurance obligatoire', contrat.assuranceObligatoire ? 'Oui' : 'Non'],
                ['Clause responsabilité marchandises', contrat.clauseResponsabiliteMarchandises ? 'Oui' : 'Non'],
                ['Obligations particulières', contrat.obligationsParticulieres || 'Aucune'],
                ['Conditions de résiliation', contrat.conditionsResiliation || 'Standard'],
            ];

            conditions.forEach(([label, value]) => {
                if (y > pageHeight - 30) {
                    doc.addPage();
                    y = 20;
                    doc.setDrawColor(26, 95, 122);
                    doc.setLineWidth(1);
                    doc.line(margin, 10, pageWidth - margin, 10);
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(`Contrat #${contrat.id} - Suite`, pageWidth / 2, 18, { align: 'center' });
                    doc.setDrawColor(212, 168, 67);
                    doc.setLineWidth(0.5);
                    doc.line(margin, 22, pageWidth - margin, 22);
                    y = 30;
                }
                doc.setFont('helvetica', 'bold');
                doc.text(label + ' :', margin, y);
                doc.setFont('helvetica', 'normal');
                const wrappedValue = doc.splitTextToSize(value || 'Non spécifié', pageWidth - margin * 2 - 80);
                doc.text(wrappedValue, margin + 75, y);
                y += wrappedValue.length * 5 + 4;
            });

            // ===== PIED DE PAGE =====
            // Signatures
            if (y > pageHeight - 70) {
                doc.addPage();
                y = 20;
                doc.setDrawColor(26, 95, 122);
                doc.setLineWidth(1);
                doc.line(margin, 10, pageWidth - margin, 10);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Contrat #${contrat.id} - Suite`, pageWidth / 2, 18, { align: 'center' });
                doc.setDrawColor(212, 168, 67);
                doc.setLineWidth(0.5);
                doc.line(margin, 22, pageWidth - margin, 22);
                y = 30;
            }

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 95, 122);
            doc.text('SIGNATURES', pageWidth / 2, y, { align: 'center' });
            y += 12;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);
            doc.setFontSize(10);
            doc.text(`Fait à Casablanca, le ${date}`, pageWidth / 2, y, { align: 'center' });
            y += 15;

            // Lignes de signature
            const signatureY = y;
            doc.text('Signature du bailleur :', margin + 50, signatureY);
            doc.text('Signature du locataire :', pageWidth - margin - 50, signatureY, { align: 'right' });
            
            // Lignes pour les signatures
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            const lineY = signatureY + 8;
            doc.line(margin + 50, lineY, margin + 150, lineY);
            doc.line(pageWidth - margin - 150, lineY, pageWidth - margin - 50, lineY);

            // ===== PIED DE PAGE =====
            const addFooter = (pageNum) => {
                const footerY = pageHeight - 15;
                
                // Ligne décorative
                doc.setDrawColor(212, 168, 67);
                doc.setLineWidth(0.5);
                doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                
                // Texte du pied de page
                doc.setFontSize(7);
                doc.setTextColor(150);
                
                if (PDF_CONFIG.footer.text) {
                    doc.text(PDF_CONFIG.footer.text, pageWidth / 2, footerY, { align: 'center' });
                }
                
                if (PDF_CONFIG.footer.showPageNumbers) {
                    doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
                }
                
                // Numéro de contrat en bas à gauche
                doc.text(`Contrat #${contrat.id}`, margin, footerY);
            };

            // Ajouter le pied de page à chaque page
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                addFooter(i);
            }

            doc.save(`contrat_${contrat.id}_${date.replace(/\//g, '-')}.pdf`);
            toast.success('✅ PDF généré avec succès');
        } catch (error) {
            console.error('❌ Erreur PDF:', error);
            toast.error('Erreur lors de la génération du PDF');
        }
    };

    const apercuPDFContrat = (id) => {
        try {
            const contrat = data.find(c => c.id === id);
            if (!contrat) return toast.error('Contrat non trouvé');
            
            const espace = espaces.find(e => e.id === contrat.espaceId);
            const locataire = locataires.find(l => l.id === contrat.locataireId);
            const date = new Date().toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            setPdfContent({
                contrat,
                espace,
                locataire,
                date
            });
            setPdfModalOpen(true);
        } catch (error) {
            console.error('❌ Erreur aperçu:', error);
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

    const getStatusColor = (statut) => {
        const colors = {
            'brouillon_import': { bg: '#f1f5f9', text: '#64748b' },
            'en_attente_validation': { bg: '#fef9c3', text: '#854d0e' },
            'actif': { bg: '#dcfce7', text: '#166534' },
            'expire': { bg: '#f1f5f9', text: '#64748b' },
            'resilie': { bg: '#fee2e2', text: '#991b1b' },
            'renouvele': { bg: '#dbeafe', text: '#1e40af' }
        };
        return colors[statut] || { bg: '#f1f5f9', text: '#64748b' };
    };

    const getStatusLabel = (statut) => {
        const labels = {
            'brouillon_import': 'Brouillon',
            'en_attente_validation': 'En attente validation',
            'actif': 'Actif',
            'expire': 'Expiré',
            'resilie': 'Résilié',
            'renouvele': 'Renouvelé'
        };
        return labels[statut] || statut;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
                <span style={{ marginLeft: '12px', color: '#64748b' }}>Chargement des contrats...</span>
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
                    onClick={loadAllData}
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

    // Filtrage des contrats
    const filteredData = data.filter(item => {
        const statusMatch = filterStatus === 'all' || item.statut === filterStatus;
        const searchMatch = !searchTerm || 
            item.id.toString().includes(searchTerm) ||
            getEspaceName(item.espaceId).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLocataireName(item.locataireId).toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
    });

    // Statistiques
    const totalContrats = data.length;
    const actifs = data.filter(c => c.statut === 'actif').length;
    const enAttente = data.filter(c => c.statut === 'en_attente_validation').length;
    const resilies = data.filter(c => c.statut === 'resilie').length;

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

            {/* Statistiques */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px', 
                marginBottom: '20px' 
            }}>
                <div style={{ 
                    background: '#fff', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{totalContrats}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Total</div>
                </div>
                <div style={{ 
                    background: '#fff', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    border: '1px solid #dcfce7',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{actifs}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Actifs</div>
                </div>
                <div style={{ 
                    background: '#fff', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    border: '1px solid #fef9c3',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{enAttente}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>En attente</div>
                </div>
                <div style={{ 
                    background: '#fff', 
                    borderRadius: '8px', 
                    padding: '12px 16px', 
                    border: '1px solid #fee2e2',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{resilies}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Résiliés</div>
                </div>
            </div>

            {/* Filtres et actions */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px', 
                flexWrap: 'wrap', 
                gap: '12px' 
            }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            minWidth: '200px'
                        }}
                    />
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '13px',
                            background: '#fff'
                        }}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="brouillon_import">Brouillon</option>
                        <option value="en_attente_validation">En attente</option>
                        <option value="actif">Actif</option>
                        <option value="expire">Expiré</option>
                        <option value="resilie">Résilié</option>
                        <option value="renouvele">Renouvelé</option>
                    </select>
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
                        <i className="fas fa-plus"></i> Nouveau contrat
                    </button>
                )}
            </div>

            {/* Tableau des contrats */}
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
                            {filteredData.map(item => {
                                const statusColors = getStatusColor(item.statut);
                                const isDeleting = deletingId === item.id;
                                return (
                                    <tr key={item.id} style={{ 
                                        borderBottom: '1px solid #f1f5f9', 
                                        transition: 'all 0.2s',
                                        opacity: isDeleting ? 0.5 : 1,
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {isDeleting && (
                                            <td colSpan="8" style={{ 
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'rgba(255,255,255,0.7)',
                                                zIndex: 10
                                            }}>
                                                <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                                            </td>
                                        )}
                                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>#{item.id}</td>
                                        <td style={{ padding: '12px 16px' }}>{getEspaceName(item.espaceId)}</td>
                                        <td style={{ padding: '12px 16px' }}>{getLocataireName(item.locataireId)}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px' }}>{item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : '-'}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '13px' }}>{item.dateFin ? new Date(item.dateFin).toLocaleDateString('fr-FR') : '-'}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1a5f7a' }}>{item.montantLoyer || 0} MAD</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '12px', 
                                                fontWeight: '600',
                                                background: statusColors.bg,
                                                color: statusColors.text
                                            }}>
                                                {getStatusLabel(item.statut)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                <button 
                                                    className="btn btn-xs btn-outline" 
                                                    style={{ 
                                                        padding: '4px 10px', 
                                                        fontSize: '12px', 
                                                        background: 'transparent', 
                                                        border: '1px solid #cbd5e1', 
                                                        borderRadius: '6px', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => openModal(item)}
                                                    title="Modifier"
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
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => genererPDFContrat(item.id)}
                                                    title="Télécharger PDF"
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
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => apercuPDFContrat(item.id)}
                                                    title="Aperçu PDF"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {item.statut === 'actif' && (
                                                    <button 
                                                        className="btn btn-xs btn-warning" 
                                                        style={{ 
                                                            padding: '4px 10px', 
                                                            fontSize: '12px', 
                                                            background: '#f59e0b', 
                                                            color: '#fff', 
                                                            border: 'none', 
                                                            borderRadius: '6px', 
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onClick={() => resilierContrat(item.id)}
                                                        disabled={actionInProgress}
                                                        title="Résilier"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                                {item.statut !== 'actif' && item.statut !== 'brouillon_import' && (
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
                                                        disabled={isDeleting}
                                                        title="Supprimer"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                                        <i className="fas fa-file-signature" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                                        {searchTerm || filterStatus !== 'all' 
                                            ? 'Aucun contrat ne correspond à votre recherche'
                                            : 'Aucun contrat enregistré'}
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
                                {editingContrat ? '✏️ Modifier un contrat' : '📄 Nouveau contrat'}
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
                            {/* Informations principales */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Espace *
                                    </label>
                                    <select 
                                        name="espaceId" 
                                        value={formData.espaceId} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: `1px solid ${formErrors.espaceId ? '#ef4444' : '#cbd5e1'}`, 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }} 
                                        required
                                    >
                                        <option value="">Sélectionner un espace</option>
                                        {espaces.filter(e => e.statut === 'disponible' || e.id === editingContrat?.espaceId).map(e => (
                                            <option key={e.id} value={e.id}>{e.numero} - {e.designation}</option>
                                        ))}
                                    </select>
                                    {formErrors.espaceId && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.espaceId}</span>}
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Locataire *
                                    </label>
                                    <select 
                                        name="locataireId" 
                                        value={formData.locataireId} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: `1px solid ${formErrors.locataireId ? '#ef4444' : '#cbd5e1'}`, 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }} 
                                        required
                                    >
                                        <option value="">Sélectionner un locataire</option>
                                        {locataires.map(l => (
                                            <option key={l.id} value={l.id}>{l.nomComplet}</option>
                                        ))}
                                    </select>
                                    {formErrors.locataireId && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.locataireId}</span>}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date signature</label>
                                    <input type="date" name="dateSignature" value={formData.dateSignature} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Date début *
                                    </label>
                                    <input 
                                        type="date" 
                                        name="dateDebut" 
                                        value={formData.dateDebut} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: `1px solid ${formErrors.dateDebut ? '#ef4444' : '#cbd5e1'}`, 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }} 
                                        required 
                                    />
                                    {formErrors.dateDebut && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.dateDebut}</span>}
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Date fin *
                                    </label>
                                    <input 
                                        type="date" 
                                        name="dateFin" 
                                        value={formData.dateFin} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: `1px solid ${formErrors.dateFin ? '#ef4444' : '#cbd5e1'}`, 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }} 
                                        required 
                                    />
                                    {formErrors.dateFin && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.dateFin}</span>}
                                </div>
                            </div>

                            {/* Montants */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Loyer (MAD) *
                                    </label>
                                    <input 
                                        type="number" 
                                        name="montantLoyer" 
                                        value={formData.montantLoyer} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: `1px solid ${formErrors.montantLoyer ? '#ef4444' : '#cbd5e1'}`, 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }} 
                                        required 
                                    />
                                    {formErrors.montantLoyer && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.montantLoyer}</span>}
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Charges (MAD)</label>
                                    <input type="number" name="montantCharges" value={formData.montantCharges} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        Caution (MAD) *
                                    </label>
                                    <input 
                                        type="number" 
                                        name="montantCaution" 
                                        value={formData.montantCaution} 
                                        onChange={handleInputChange} 
                                        style={{ 
                                            width: '100%', 
                                            padding: '8px 12px', 
                                            border: `1px solid ${formErrors.montantCaution ? '#ef4444' : '#cbd5e1'}`, 
                                            borderRadius: '6px', 
                                            fontSize: '14px' 
                                        }} 
                                        required 
                                    />
                                    {formErrors.montantCaution && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.montantCaution}</span>}
                                </div>
                            </div>

                            {/* Autres options */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Durée (mois)</label>
                                    <input type="number" name="dureeMois" value={formData.dureeMois} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Périodicité</label>
                                    <select name="periodicite" value={formData.periodicite} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="mensuel">Mensuel</option>
                                        <option value="trimestriel">Trimestriel</option>
                                        <option value="annuel">Annuel</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Statut</label>
                                    <select name="statut" value={formData.statut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                                        <option value="brouillon_import">📝 Brouillon</option>
                                        <option value="en_attente_validation">⏳ En attente validation</option>
                                        <option value="actif">✅ Actif</option>
                                        <option value="expire">⌛ Expiré</option>
                                        <option value="resilie">❌ Résilié</option>
                                        <option value="renouvele">🔄 Renouvelé</option>
                                    </select>
                                </div>
                            </div>

                            {/* Texte */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Modalités de paiement</label>
                                    <input type="text" name="modalitesPaiement" value={formData.modalitesPaiement} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Date paiement prévue</label>
                                    <input type="date" name="datePaiementPrevue" value={formData.datePaiementPrevue} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Pénalités de retard</label>
                                <input type="text" name="penalitesRetard" value={formData.penalitesRetard} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Obligations particulières</label>
                                    <textarea name="obligationsParticulieres" value={formData.obligationsParticulieres} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '50px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Conditions de résiliation</label>
                                    <textarea name="conditionsResiliation" value={formData.conditionsResiliation} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '50px' }} />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        <input type="checkbox" name="renouvellementAuto" checked={formData.renouvellementAuto === 1} onChange={handleInputChange} style={{ marginRight: '4px' }} />
                                        🔄 Renouvellement automatique
                                    </label>
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        <input type="checkbox" name="assuranceObligatoire" checked={formData.assuranceObligatoire === 1} onChange={handleInputChange} style={{ marginRight: '4px' }} />
                                        🛡️ Assurance obligatoire
                                    </label>
                                </div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>
                                        <input type="checkbox" name="clauseResponsabiliteMarchandises" checked={formData.clauseResponsabiliteMarchandises === 1} onChange={handleInputChange} style={{ marginRight: '4px' }} />
                                        📦 Clause responsabilité marchandises
                                    </label>
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
                                    <i className="fas fa-save"></i> {editingContrat ? 'Mettre à jour' : 'Créer'}
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
                                    ['Total mensuel', ((pdfContent.contrat.montantLoyer || 0) + (pdfContent.contrat.montantCharges || 0)) + ' MAD'],
                                    ['Caution', (pdfContent.contrat.montantCaution || 0) + ' MAD'],
                                    ['Statut', getStatusLabel(pdfContent.contrat.statut)],
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
                            }}>
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
                            }}>
                                <i className="fas fa-download"></i> Télécharger PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contrats;