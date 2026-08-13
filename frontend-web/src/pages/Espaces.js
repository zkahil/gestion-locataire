// src/pages/Espaces.js - Version corrigée avec légende bien positionnée

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Espaces = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [sites, setSites] = useState([]);
    const [etages, setEtages] = useState([]);
    const [currentSite, setCurrentSite] = useState(null);
    const [currentEtage, setCurrentEtage] = useState('RC');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEspace, setEditingEspace] = useState(null);
    const [siteModalOpen, setSiteModalOpen] = useState(false);
    const [etageModalOpen, setEtageModalOpen] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [editingEtage, setEditingEtage] = useState(null);
    const svgRef = useRef(null);

    const isEditable = user?.role === 'admin' || user?.role === 'gestionnaire';
    const isAdmin = user?.role === 'admin';

    const [formData, setFormData] = useState({
        numero: '',
        designation: '',
        type: 'bureau',
        superficie: '',
        etage: 'RC',
        siteId: '',
        positionX: 30,
        positionY: 30,
        largeur: 120,
        hauteur: 80,
        couleur: '#94a3b8',
        loyerReference: '',
        statut: 'disponible'
    });

    const [siteFormData, setSiteFormData] = useState({
        nom: '',
        adresse: '',
        ville: '',
        codePostal: '',
        pays: 'Maroc',
        latitude: '',
        longitude: '',
        description: ''
    });

    const [etageFormData, setEtageFormData] = useState({
        nom: '',
        niveau: 0,
        description: ''
    });

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [sitesRes, espacesRes, etagesRes] = await Promise.all([
                api.get('/sites'),
                api.get('/espaces'),
                api.get('/etages')
            ]);
            
            const sitesData = sitesRes.data.data || [];
            const espacesData = espacesRes.data.data || [];
            const etagesData = etagesRes.data.data || [];
            
            setSites(sitesData);
            setData(espacesData);
            setEtages(etagesData);
            
            if (sitesData.length > 0 && !currentSite) {
                setCurrentSite(sitesData[0]);
                const siteEtagesList = etagesData.filter(et => et.siteId === sitesData[0].id);
                if (siteEtagesList.length > 0) {
                    setCurrentEtage(siteEtagesList[0].nom);
                }
            }
        } catch (error) {
            toast.error('Erreur de chargement');
            console.error(error);
        }
        setLoading(false);
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

    const getSpaceIcon = (type) => {
        const icons = {
            boutique: 'fa-store',
            depot: 'fa-warehouse',
            bureau: 'fa-building',
            stand: 'fa-booth',
            commun: 'fa-people-arrows',
            bureau_directeur: 'fa-crown',
            bureau_open: 'fa-users',
            salle_reunion: 'fa-users-between-lines',
            espace_vert: 'fa-tree',
            couloir: 'fa-arrow-right',
            ascenseur: 'fa-elevator',
            porte: 'fa-door-open'
        };
        return icons[type] || 'fa-square';
    };

    const openModal = (espace = null) => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour modifier');
            return;
        }
        if (espace) {
            setEditingEspace(espace);
            setFormData({
                numero: espace.numero || '',
                designation: espace.designation || '',
                type: espace.type || 'bureau',
                superficie: espace.superficie || '',
                etage: espace.etage || 'RC',
                siteId: espace.siteId || currentSite?.id || '',
                positionX: espace.positionX || 30,
                positionY: espace.positionY || 30,
                largeur: espace.largeur || 120,
                hauteur: espace.hauteur || 80,
                couleur: espace.couleur || '#94a3b8',
                loyerReference: espace.loyerReference || '',
                statut: espace.statut || 'disponible'
            });
        } else {
            setEditingEspace(null);
            setFormData({
                numero: '',
                designation: '',
                type: 'bureau',
                superficie: '',
                etage: 'RC',
                siteId: currentSite?.id || '',
                positionX: 30,
                positionY: 30,
                largeur: 120,
                hauteur: 80,
                couleur: '#94a3b8',
                loyerReference: '',
                statut: 'disponible'
            });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingEspace(null);
    };

    const openSiteModal = (site = null) => {
        if (!isAdmin) {
            toast.error('Seul un administrateur peut gérer les sites');
            return;
        }
        if (site) {
            setEditingSite(site);
            setSiteFormData({
                nom: site.nom || '',
                adresse: site.adresse || '',
                ville: site.ville || '',
                codePostal: site.codePostal || '',
                pays: site.pays || 'Maroc',
                latitude: site.latitude || '',
                longitude: site.longitude || '',
                description: site.description || ''
            });
        } else {
            setEditingSite(null);
            setSiteFormData({
                nom: '',
                adresse: '',
                ville: '',
                codePostal: '',
                pays: 'Maroc',
                latitude: '',
                longitude: '',
                description: ''
            });
        }
        setSiteModalOpen(true);
    };

    const closeSiteModal = () => {
        setSiteModalOpen(false);
        setEditingSite(null);
    };

    const openEtageModal = (etage = null) => {
        if (!isEditable) {
            toast.error('Vous n\'avez pas les droits pour modifier');
            return;
        }
        if (etage) {
            setEditingEtage(etage);
            setEtageFormData({
                nom: etage.nom || '',
                niveau: etage.niveau || 0,
                description: etage.description || ''
            });
        } else {
            setEditingEtage(null);
            setEtageFormData({
                nom: '',
                niveau: 0,
                description: ''
            });
        }
        setEtageModalOpen(true);
    };

    const closeEtageModal = () => {
        setEtageModalOpen(false);
        setEditingEtage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSiteInputChange = (e) => {
        const { name, value } = e.target;
        setSiteFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEtageInputChange = (e) => {
        const { name, value } = e.target;
        setEtageFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditable) return;
        try {
            const dataToSend = {
                ...formData,
                superficie: parseFloat(formData.superficie) || 0,
                loyerReference: parseFloat(formData.loyerReference) || 0,
                positionX: parseInt(formData.positionX) || 30,
                positionY: parseInt(formData.positionY) || 30,
                largeur: parseInt(formData.largeur) || 120,
                hauteur: parseInt(formData.hauteur) || 80,
                siteId: parseInt(formData.siteId) || null
            };

            if (editingEspace) {
                await api.put(`/espaces/${editingEspace.id}`, dataToSend);
                toast.success('Espace modifié avec succès');
            } else {
                await api.post('/espaces', dataToSend);
                toast.success('Espace créé avec succès');
            }
            closeModal();
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const handleSiteSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        try {
            const dataToSend = {
                ...siteFormData,
                latitude: parseFloat(siteFormData.latitude) || null,
                longitude: parseFloat(siteFormData.longitude) || null
            };

            if (editingSite) {
                await api.put(`/sites/${editingSite.id}`, dataToSend);
                toast.success('Site modifié avec succès');
            } else {
                await api.post('/sites', dataToSend);
                toast.success('Site créé avec succès');
            }
            closeSiteModal();
            setEditingSite(null);
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const handleEtageSubmit = async (e) => {
        e.preventDefault();
        if (!isEditable) return;
        try {
            const dataToSend = {
                ...etageFormData,
                siteId: currentSite?.id,
                niveau: parseInt(etageFormData.niveau) || 0
            };

            if (editingEtage) {
                await api.put(`/etages/${editingEtage.id}`, dataToSend);
                toast.success('Étage modifié avec succès');
            } else {
                await api.post('/etages', dataToSend);
                toast.success('Étage créé avec succès');
            }
            closeEtageModal();
            setEditingEtage(null);
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const deleteEspace = async (id) => {
        if (!isEditable) return;
        if (!confirm('Supprimer cet espace ?')) return;
        try {
            await api.delete(`/espaces/${id}`);
            toast.success('Espace supprimé');
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const deleteSite = async (id) => {
        if (!isAdmin) {
            toast.error('Seul un administrateur peut supprimer un site');
            return;
        }
        if (!confirm('Supprimer ce site et tous ses espaces ?')) return;
        try {
            await api.delete(`/sites/${id}`);
            toast.success('Site supprimé');
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const deleteEtage = async (id) => {
        if (!isEditable) return;
        if (!confirm('Supprimer cet étage et tous ses espaces ?')) return;
        try {
            await api.delete(`/etages/${id}`);
            toast.success('Étage supprimé');
            loadAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    // Fonction de capture PNG optimisée
    const captureGrid = () => {
        if (!svgRef.current) {
            toast.error('Erreur: impossible de capturer la grille');
            return;
        }

        try {
            const svgElement = svgRef.current;
            
            // Clone le SVG pour éviter les problèmes
            const cloneSvg = svgElement.cloneNode(true);
            
            // Ajoute un fond blanc
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("width", "100%");
            rect.setAttribute("height", "100%");
            rect.setAttribute("fill", "#ffffff");
            cloneSvg.insertBefore(rect, cloneSvg.firstChild);
            
            // Récupère les dimensions du viewBox
            const viewBox = cloneSvg.getAttribute('viewBox') || '0 0 900 550';
            const viewBoxParts = viewBox.split(' ').map(Number);
            const width = viewBoxParts[2] || 900;
            const height = viewBoxParts[3] || 550;
            
            // Crée un canvas haute résolution
            const scale = 3;
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            
            // Fond blanc
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Sérialise le SVG
            const svgData = new XMLSerializer().serializeToString(cloneSvg);
            
            // Crée l'URL du blob SVG
            const svgBlob = new Blob([svgData], { 
                type: 'image/svg+xml;charset=utf-8' 
            });
            const url = URL.createObjectURL(svgBlob);
            
            // Charge l'image
            const img = new Image();
            
            img.onload = function() {
                // Dessine l'image sur le canvas
                ctx.drawImage(img, 0, 0, width * scale, height * scale);
                URL.revokeObjectURL(url);
                
                // Convertit en PNG
                const pngDataUrl = canvas.toDataURL('image/png', 1.0);
                
                // Télécharge
                const link = document.createElement('a');
                const dateStr = new Date().toISOString().split('T')[0];
                const timeStr = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
                link.download = `plan_${currentSite?.nom || 'site'}_${currentEtage || 'RC'}_${dateStr}_${timeStr}.png`;
                link.href = pngDataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success('📸 Grille capturée avec succès !');
            };
            
            img.onerror = function(e) {
                console.error('Erreur de chargement de l\'image:', e);
                toast.error('Erreur lors de la capture. Vérifiez la console.');
            };
            
            img.src = url;
            
        } catch (error) {
            console.error('Erreur de capture:', error);
            toast.error('Erreur lors de la capture');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const filteredData = data.filter(e => {
        const siteMatch = currentSite ? e.siteId === currentSite.id : true;
        const etageMatch = currentEtage ? e.etage === currentEtage : true;
        return siteMatch && etageMatch;
    });

    const siteEtages = etages.filter(e => e.siteId === currentSite?.id);

    // Calcul des dimensions pour la grille SVG
    const padding = 60;
    const viewWidth = 900;
    const viewHeight = 550;
    
    const maxX = Math.max(...filteredData.map(e => (e.positionX || 30) + (e.largeur || 120)), 100);
    const maxY = Math.max(...filteredData.map(e => (e.positionY || 30) + (e.hauteur || 80)), 100);
    
    const scaleX = (viewWidth - padding * 2) / (maxX + padding);
    const scaleY = (viewHeight - padding * 2 - 60) / (maxY + padding);
    const scale = Math.min(scaleX, scaleY, 1.5);
    
    let gridSize = 40;
    if (maxX > 1000) gridSize = 100;
    if (maxX > 5000) gridSize = 200;
    if (maxX > 10000) gridSize = 500;
    
    const scaledGridSize = gridSize * scale;

    const totalEspaces = filteredData.length;
    const occupes = filteredData.filter(e => e.statut === 'occupe').length;
    const disponibles = filteredData.filter(e => e.statut === 'disponible').length;
    const travaux = filteredData.filter(e => e.statut === 'travaux').length;
    const communs = filteredData.filter(e => e.statut === 'commun').length;

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-door-open" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Espaces
                    <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748b', marginLeft: '12px' }}>
                        {filteredData.length} espaces sur {data.length} total
                    </span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Gestion des sites, étages et espaces
                </p>
            </div>

            {/* Gestion des sites */}
            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                padding: '16px 20px', 
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            <i className="fas fa-building" style={{ color: '#1a5f7a', marginRight: '6px' }}></i>
                            Site:
                        </span>
                        <select 
                            value={currentSite?.id || ''} 
                            onChange={(e) => {
                                const site = sites.find(s => s.id === parseInt(e.target.value));
                                setCurrentSite(site || null);
                                if (site) {
                                    const siteEtagesList = etages.filter(et => et.siteId === site.id);
                                    if (siteEtagesList.length > 0) {
                                        setCurrentEtage(siteEtagesList[0].nom);
                                    }
                                }
                            }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                background: '#fff',
                                minWidth: '150px'
                            }}
                        >
                            {sites.map(site => (
                                <option key={site.id} value={site.id}>
                                    {site.nom} {site.ville ? `(${site.ville})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {isAdmin && (
                            <>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openSiteModal()}
                                    style={{ 
                                        padding: '6px 14px', 
                                        fontSize: '12px',
                                        background: '#1a5f7a',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <i className="fas fa-plus"></i> Site
                                </button>
                                {currentSite && (
                                    <>
                                        <button 
                                            className="btn btn-outline btn-sm"
                                            onClick={() => openSiteModal(currentSite)}
                                            style={{ 
                                                padding: '6px 14px', 
                                                fontSize: '12px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                background: 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <i className="fas fa-edit"></i> Modifier
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteSite(currentSite.id)}
                                            style={{ 
                                                padding: '6px 14px', 
                                                fontSize: '12px',
                                                background: '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
                {currentSite && currentSite.latitude && currentSite.longitude && (
                    <div style={{ 
                        marginTop: '8px', 
                        fontSize: '12px', 
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <i className="fas fa-map-pin"></i>
                        Coordonnées GPS: {currentSite.latitude}, {currentSite.longitude}
                        {currentSite.adresse && ` · ${currentSite.adresse}`}
                        {currentSite.ville && `, ${currentSite.ville}`}
                    </div>
                )}
            </div>

            {/* Étages et actions */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div className="etage-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {siteEtages.length > 0 ? (
                        siteEtages.map(etage => (
                            <div key={etage.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span 
                                    className={`tab ${currentEtage === etage.nom ? 'active' : ''}`}
                                    onClick={() => setCurrentEtage(etage.nom)}
                                    style={{ 
                                        padding: '8px 20px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #e2e8f0',
                                        cursor: 'pointer',
                                        background: currentEtage === etage.nom ? '#1a5f7a' : '#fff',
                                        color: currentEtage === etage.nom ? '#fff' : '#334155',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {etage.nom} {etage.description && `(${etage.description})`}
                                </span>
                                {isEditable && (
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        <button
                                            onClick={() => openEtageModal(etage)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                fontSize: '12px'
                                            }}
                                            title="Modifier l'étage"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => deleteEtage(etage.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#94a3b8',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                fontSize: '12px'
                                            }}
                                            title="Supprimer l'étage"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                            <i className="fas fa-info-circle"></i> Aucun étage configuré
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {isEditable && (
                        <>
                            <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => openEtageModal()}
                                style={{ 
                                    padding: '6px 14px', 
                                    fontSize: '12px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <i className="fas fa-plus"></i> Étage
                            </button>
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
                                <i className="fas fa-plus"></i> Ajouter un espace
                            </button>
                            <button 
                                className="btn btn-success"
                                onClick={captureGrid}
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
                                    background: '#16a34a', 
                                    color: '#fff',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                                title="Capturer la grille en PNG haute résolution"
                            >
                                <i className="fas fa-camera"></i> Capturer PNG
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Plan SVG avec grille dynamique - LÉGENDE CORRIGÉE */}
            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                padding: '16px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>
                        <i className="fas fa-map" style={{ marginRight: '8px', color: '#1a5f7a' }}></i>
                        Plan des espaces - {currentSite?.nom || 'Site'} · {currentEtage || 'RC'}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {filteredData.length} espaces · Grille {gridSize}px
                    </span>
                </div>
                <div className="plan-container" style={{ 
                    background: '#f8fafc', 
                    borderRadius: '8px', 
                    padding: '10px', 
                    border: '1px solid #e2e8f0', 
                    overflow: 'auto',
                    position: 'relative'
                }}>
                    <svg 
                        ref={svgRef}
                        width="100%" 
                        height={viewHeight} 
                        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        style={{ background: '#fafbfc', borderRadius: '6px', display: 'block' }}
                    >
                        <defs>
                            <pattern id="grid_espaces" width={scaledGridSize} height={scaledGridSize} patternUnits="userSpaceOnUse">
                                <path d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`} fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                            </pattern>
                            <pattern id="grid_espaces_light" width={scaledGridSize * 5} height={scaledGridSize * 5} patternUnits="userSpaceOnUse">
                                <path d={`M ${scaledGridSize * 5} 0 L 0 0 0 ${scaledGridSize * 5}`} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeOpacity="0.3"/>
                            </pattern>
                        </defs>
                        <rect width={viewWidth} height={viewHeight} fill="url(#grid_espaces_light)" />
                        <rect width={viewWidth} height={viewHeight} fill="url(#grid_espaces)" />
                        <line x1="0" y1={viewHeight - 30} x2={viewWidth} y2={viewHeight - 30} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4,4" />
                        
                        {/* Axe X */}
                        <line x1="0" y1={viewHeight - 30} x2={viewWidth} y2={viewHeight - 30} stroke="#94a3b8" strokeWidth="2" />
                        <line x1="0" y1={viewHeight - 35} x2="0" y2={viewHeight - 25} stroke="#94a3b8" strokeWidth="2" />
                        <text x="4" y={viewHeight - 10} fontSize="9" fontWeight="700" fill="#475569">X</text>
                        
                        {Array.from({ length: Math.ceil(viewWidth / scaledGridSize) + 1 }, (_, i) => i).map(i => {
                            const x = i * scaledGridSize + 20;
                            const value = i * gridSize;
                            if (x < viewWidth - 20) {
                                return (
                                    <g key={`x-${i}`}>
                                        <line x1={x} y1={viewHeight - 34} x2={x} y2={viewHeight - 26} stroke="#94a3b8" strokeWidth="1.5" />
                                        <text x={x} y={viewHeight - 12} fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">{value}</text>
                                    </g>
                                );
                            }
                            return null;
                        })}
                        
                        {/* Axe Y */}
                        <line x1="30" y1="0" x2="30" y2={viewHeight - 30} stroke="#94a3b8" strokeWidth="2" />
                        <line x1="25" y1="0" x2="35" y2="0" stroke="#94a3b8" strokeWidth="2" />
                        <text x="16" y="10" fontSize="9" fontWeight="700" fill="#475569">Y</text>
                        
                        {Array.from({ length: Math.ceil(viewHeight / scaledGridSize) + 1 }, (_, i) => i).map(i => {
                            const y = i * scaledGridSize + 20;
                            const value = i * gridSize;
                            if (y < viewHeight - 40) {
                                return (
                                    <g key={`y-${i}`}>
                                        <line x1="26" y1={y} x2="34" y2={y} stroke="#94a3b8" strokeWidth="1.5" />
                                        <text x="18" y={y + 3} fontSize="7" fill="#94a3b8" textAnchor="end" fontFamily="monospace">{value}</text>
                                    </g>
                                );
                            }
                            return null;
                        })}

                        <text x="30" y={viewHeight - 12} fontSize="8" fill="#ef4444" textAnchor="middle" fontWeight="700">O</text>

                        {/* Espaces */}
                        {filteredData.map(e => {
                            const color = getSpaceColor(e.type);
                            const isCommun = e.statut === 'commun';
                            const posX = (e.positionX || 30) * scale + 20;
                            const posY = (e.positionY || 30) * scale + 20;
                            const width = Math.max((e.largeur || 120) * scale, 15);
                            const height = Math.max((e.hauteur || 80) * scale, 15);
                            const isOccupied = e.statut === 'occupe';
                            const isAvailable = e.statut === 'disponible';
                            
                            if (posX > viewWidth || posY > viewHeight) return null;
                            
                            return (
                                <g key={e.id}>
                                    <rect x={posX + 2} y={posY + 2} width={width} height={height} rx="4" fill="rgba(0,0,0,0.08)" />
                                    <rect x={posX} y={posY} width={width} height={height} rx="6" fill={color} stroke={isOccupied ? '#f59e0b' : isAvailable ? '#22c55e' : '#94a3b8'} strokeWidth={isCommun ? '1.5' : '2.5'} strokeDasharray={isCommun ? '4,4' : 'none'} opacity={isCommun ? '0.6' : '0.9'} style={{ cursor: isEditable ? 'pointer' : 'default' }} onClick={() => isEditable && openModal(e)} />
                                    {width > 40 && height > 30 && (
                                        <>
                                            <circle cx={posX + 14} cy={posY + 14} r="9" fill="rgba(255,255,255,0.9)" stroke={color} strokeWidth="1.5" />
                                            <text x={posX + 14} y={posY + 18} fontSize="9" fontWeight="700" fill={color} textAnchor="middle">
                                                {((e.designation || e.type || '?').trim().charAt(0) || '?').toUpperCase()}
                                            </text>
                                            <text x={posX + 28} y={posY + 16} fontSize="9" fontWeight="700" fill="#1e293b">{e.numero}</text>
                                            <text x={posX + 28} y={posY + 30} fontSize="7" fill="#334155">{e.designation}</text>
                                            {!isCommun && (
                                                <>
                                                    <text x={posX + 28} y={posY + 44} fontSize="7" fill="#475569">{e.superficie || 0} m²</text>
                                                    <text x={posX + 28} y={posY + 56} fontSize="7" fill="#475569">{e.loyerReference || 0} MAD</text>
                                                </>
                                            )}
                                            {isCommun && (
                                                <text x={posX + 28} y={posY + 44} fontSize="7" fill="#64748b">Commun</text>
                                            )}
                                        </>
                                    )}
                                    <circle cx={posX + width - 10} cy={posY + 10} r="4" fill={isOccupied ? '#f59e0b' : isAvailable ? '#22c55e' : '#94a3b8'} />
                                </g>
                            );
                        })}
                        
                        {/* LÉGENDE CORRIGÉE - Positionnée à gauche sans coordonnées négatives */}
                        <g transform={`translate(15, ${viewHeight - 195})`}>
                            <rect x="0" y="0" width="195" height="180" rx="8" fill="rgba(255,255,255,0.97)" stroke="#e2e8f0" strokeWidth="1.5" />
                            <text x="12" y="20" fontSize="11" fontWeight="700" fill="#1a5f7a">📐 Légende</text>
                            <line x1="12" y1="26" x2="183" y2="26" stroke="#e2e8f0" strokeWidth="1" />
                            <g transform="translate(12, 32)">
                                <circle cx="0" cy="10" r="5" fill="#f59e0b" />
                                <text x="14" y="14" fontSize="9" fill="#334155">Occupé ({occupes})</text>
                            </g>
                            <g transform="translate(12, 50)">
                                <circle cx="0" cy="10" r="5" fill="#22c55e" />
                                <text x="14" y="14" fontSize="9" fill="#334155">Disponible ({disponibles})</text>
                            </g>
                            <g transform="translate(12, 68)">
                                <circle cx="0" cy="10" r="5" fill="#94a3b8" />
                                <text x="14" y="14" fontSize="9" fill="#334155">Travaux ({travaux})</text>
                            </g>
                            <g transform="translate(12, 86)">
                                <circle cx="0" cy="10" r="5" fill="#94a3b8" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,2" />
                                <text x="14" y="14" fontSize="9" fill="#334155">Commun ({communs})</text>
                            </g>
                            <line x1="12" y1="100" x2="183" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" />
                            <text x="12" y="116" fontSize="8" fill="#94a3b8">Total: {totalEspaces}</text>
                            <text x="95" y="116" fontSize="8" fill="#94a3b8">Taux occ: {totalEspaces > 0 ? Math.round((occupes / totalEspaces) * 100) : 0}%</text>
                            <text x="12" y="130" fontSize="8" fill="#94a3b8">Grille: {gridSize}px</text>
                            <text x="95" y="130" fontSize="8" fill="#94a3b8">Échelle: {scale.toFixed(2)}x</text>
                            <text x="12" y="144" fontSize="8" fill="#94a3b8" fontStyle="italic">Étage: {currentEtage || 'RC'}</text>
                            <text x="95" y="144" fontSize="8" fill="#94a3b8" fontStyle="italic">Site: {currentSite?.nom || 'N/A'}</text>
                            <text x="12" y="158" fontSize="8" fill="#94a3b8">Cliquez sur un espace pour modifier</text>
                        </g>
                        
                        {/* Compteur en haut à droite */}
                        <g>
                            <rect x={viewWidth - 160} y="10" width="150" height="36" rx="6" fill="rgba(255,255,255,0.95)" stroke="#e2e8f0" strokeWidth="1" />
                            <text x={viewWidth - 85} y="28" fontSize="10" fontWeight="600" fill="#1a5f7a" textAnchor="middle">
                                {filteredData.length} espaces
                            </text>
                            <text x={viewWidth - 85} y="40" fontSize="8" fill="#94a3b8" textAnchor="middle">
                                {occupes} occupés · {disponibles} disponibles
                            </text>
                        </g>
                    </svg>
                </div>
            </div>

            {/* Cartes des espaces - Gardez votre code existant */}
            <div className="espace-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: '16px' 
            }}>
                {filteredData.map(e => {
                    const icon = getSpaceIcon(e.type);
                    const color = getSpaceColor(e.type);
                    const isCommun = e.statut === 'commun';
                    return (
                        <div 
                            key={e.id} 
                            className={`espace-card ${e.statut}`} 
                            style={{ 
                                background: '#fff', 
                                borderRadius: '12px', 
                                border: `2px solid ${e.statut === 'occupe' ? '#f59e0b' : e.statut === 'disponible' ? '#22c55e' : '#94a3b8'}`,
                                padding: '16px',
                                position: 'relative',
                                minHeight: '160px',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: isEditable ? 'pointer' : 'default',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                            }}
                            onMouseEnter={(el) => {
                                if (isEditable) {
                                    el.currentTarget.style.borderColor = '#1a5f7a';
                                    el.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                                    el.currentTarget.style.transform = 'translateY(-4px)';
                                }
                            }}
                            onMouseLeave={(el) => {
                                if (isEditable) {
                                    el.currentTarget.style.borderColor = e.statut === 'occupe' ? '#f59e0b' : e.statut === 'disponible' ? '#22c55e' : '#94a3b8';
                                    el.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                                    el.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                            onClick={() => isEditable && openModal(e)}
                        >
                            <span 
                                className={`espace-status ${e.statut}`} 
                                style={{ 
                                    position: 'absolute', 
                                    top: '8px', 
                                    right: '8px', 
                                    fontSize: '10px', 
                                    padding: '2px 12px', 
                                    borderRadius: '12px', 
                                    fontWeight: '600',
                                    background: e.statut === 'occupe' ? '#fef9c3' : e.statut === 'disponible' ? '#dcfce7' : '#f1f5f9',
                                    color: e.statut === 'occupe' ? '#854d0e' : e.statut === 'disponible' ? '#166534' : '#64748b'
                                }}
                            >
                                {e.statut}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: `${color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: color,
                                    fontSize: '16px'
                                }}>
                                    <i className={`fas ${icon}`}></i>
                                </div>
                                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>{e.numero}</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{e.designation}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                {e.type} · {e.superficie || 0} m²
                            </div>
                            {!isCommun ? (
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                    {e.loyerReference || 0} MAD/mois
                                </div>
                            ) : (
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Espace commun</div>
                            )}
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                Étage: {e.etage || 'RC'} · Site: {sites.find(s => s.id === e.siteId)?.nom || 'N/A'}
                            </div>
                            {e.statut === 'occupe' && (
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#475569', 
                                    marginTop: '8px', 
                                    background: '#f1f5f9', 
                                    padding: '4px 10px', 
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                }}>
                                    <i className="fas fa-user" style={{ marginRight: '4px' }}></i> Occupé
                                </div>
                            )}
                            {e.statut === 'disponible' && (
                                <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px' }}>
                                    <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i> Disponible
                                </div>
                            )}
                            {e.statut === 'travaux' && (
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                    <i className="fas fa-wrench" style={{ marginRight: '4px' }}></i> Travaux
                                </div>
                            )}
                            <div style={{ 
                                marginTop: 'auto', 
                                display: 'flex', 
                                gap: '6px', 
                                paddingTop: '12px', 
                                borderTop: '1px solid #f1f5f9',
                                marginTop: '12px'
                            }}>
                                {isEditable && (
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
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={(el) => { el.stopPropagation(); openModal(e); }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {!isCommun && (
                                            <>
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
                                                    onClick={(el) => { el.stopPropagation(); deleteEspace(e.id); }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                                {e.statut === 'disponible' && (
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
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onClick={(el) => { el.stopPropagation(); toast.success('Attribution à venir'); }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                                                    >
                                                        <i className="fas fa-user-plus"></i>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filteredData.length === 0 && (
                    <div className="empty-state" style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#94a3b8',
                        gridColumn: '1 / -1'
                    }}>
                        <i className="fas fa-door-open" style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}></i>
                        <div style={{ fontSize: '16px', fontWeight: '500' }}>Aucun espace à cet étage</div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>
                            {isEditable ? 'Ajoutez un espace en cliquant sur le bouton ci-dessus' : 'Aucun espace disponible pour le moment'}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals - Gardez votre code existant */}
            {/* Modal Espace */}
            {modalOpen && isEditable && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s' }}>
                    <div className="modal" style={{ background: '#fff', borderRadius: '12px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{editingEspace ? 'Modifier un espace' : 'Ajouter un espace'}</h2>
                            <button className="close" onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8', padding: '0 4px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1e293b'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Numéro</label><input type="text" name="numero" value={formData.numero} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required /></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Désignation</label><input type="text" name="designation" value={formData.designation} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required /></div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Type</label><select name="type" value={formData.type} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}><option value="boutique">Boutique</option><option value="depot">Dépôt</option><option value="bureau">Bureau</option><option value="bureau_directeur">Bureau Directeur</option><option value="bureau_open">Open Space</option><option value="salle_reunion">Salle de réunion</option><option value="stand">Stand</option><option value="espace_vert">Espace vert</option><option value="couloir">Couloir</option><option value="ascenseur">Ascenseur</option><option value="porte">Porte</option><option value="commun">Autre commun</option></select></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Superficie (m²)</label><input type="number" name="superficie" value={formData.superficie} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Loyer référence (MAD)</label><input type="number" name="loyerReference" value={formData.loyerReference} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Statut</label><select name="statut" value={formData.statut} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}><option value="disponible">Disponible</option><option value="occupe">Occupé</option><option value="travaux">Travaux</option><option value="commun">Commun</option><option value="reserve">Réservé</option><option value="indisponible">Indisponible</option></select></div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Étage</label><select name="etage" value={formData.etage} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>{siteEtages.map(etage => <option key={etage.id} value={etage.nom}>{etage.nom}</option>)}</select></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Site</label><select name="siteId" value={formData.siteId} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>{sites.map(site => <option key={site.id} value={site.id}>{site.nom}</option>)}</select></div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Couleur</label><input type="color" name="couleur" value={formData.couleur} onChange={handleInputChange} style={{ width: '100%', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '6px', height: '40px' }} /></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Position X (px)</label><input type="number" name="positionX" value={formData.positionX} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Position Y (px)</label><input type="number" name="positionY" value={formData.positionY} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Largeur (px)</label><input type="number" name="largeur" value={formData.largeur} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                                <div className="form-group" style={{ marginBottom: '12px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Hauteur (px)</label><input type="number" name="hauteur" value={formData.hauteur} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                            </div>
                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn btn-outline" onClick={closeModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'transparent', color: '#1a5f7a', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Annuler</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer', background: '#1a5f7a', color: '#fff', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f3b5e'} onMouseLeave={(e) => e.currentTarget.style.background = '#1a5f7a'}><i className="fas fa-save"></i> Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Site */}
            {siteModalOpen && isAdmin && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s' }}>
                    <div className="modal" style={{ background: '#fff', borderRadius: '12px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{editingSite ? 'Modifier un site' : 'Ajouter un site'}</h2>
                            <button className="close" onClick={closeSiteModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8', padding: '0 4px' }}>&times;</button>
                        </div>
                        <form onSubmit={handleSiteSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Nom du site *</label><input type="text" name="nom" value={siteFormData.nom} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required /></div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Ville</label><input type="text" name="ville" value={siteFormData.ville} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                                <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Code postal</label><input type="text" name="codePostal" value={siteFormData.codePostal} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Adresse</label><input type="text" name="adresse" value={siteFormData.adresse} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Latitude</label><input type="number" step="0.000001" name="latitude" value={siteFormData.latitude} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                                <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Longitude</label><input type="number" step="0.000001" name="longitude" value={siteFormData.longitude} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} /></div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Description</label><textarea name="description" value={siteFormData.description} onChange={handleSiteInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '60px' }} /></div>
                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn btn-outline" onClick={closeSiteModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'transparent', color: '#1a5f7a', transition: 'all 0.2s' }}>Annuler</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer', background: '#1a5f7a', color: '#fff', transition: 'all 0.2s' }}><i className="fas fa-save"></i> Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Étage */}
            {etageModalOpen && isEditable && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', animation: 'fadeIn 0.2s' }}>
                    <div className="modal" style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{editingEtage ? 'Modifier un étage' : 'Ajouter un étage'}</h2>
                            <button className="close" onClick={closeEtageModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8', padding: '0 4px' }}>&times;</button>
                        </div>
                        <form onSubmit={handleEtageSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Nom de l'étage *</label>
                                <input type="text" name="nom" value={etageFormData.nom} onChange={handleEtageInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Niveau</label>
                                <input type="number" name="niveau" value={etageFormData.niveau} onChange={handleEtageInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>Description</label>
                                <input type="text" name="description" value={etageFormData.description} onChange={handleEtageInputChange} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>
                            <div style={{ 
                                marginBottom: '16px', 
                                padding: '12px', 
                                background: '#f8fafc', 
                                borderRadius: '6px',
                                fontSize: '13px',
                                color: '#64748b'
                            }}>
                                <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
                                Site associé: <strong>{currentSite?.nom || 'Aucun'}</strong>
                            </div>
                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn btn-outline" onClick={closeEtageModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'transparent', color: '#1a5f7a', transition: 'all 0.2s' }}>Annuler</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer', background: '#1a5f7a', color: '#fff', transition: 'all 0.2s' }}><i className="fas fa-save"></i> Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Espaces;