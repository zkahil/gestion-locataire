// src/pages/Reglement.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const REGLEMENT = [
    { id: 1, titre: "Objet", texte: "Le présent règlement intérieur a pour objet de définir les règles de vie et de fonctionnement au sein de l'immeuble à usage professionnel et commercial." },
    { id: 2, titre: "Accès et sécurité", texte: "L'accès à l'immeuble est strictement réservé aux locataires, leurs employés et visiteurs autorisés. Chaque locataire est responsable de la sécurité de son espace." },
    { id: 3, titre: "Horaires d'ouverture", texte: "L'immeuble est accessible du lundi au vendredi de 7h à 21h, et le samedi de 8h à 14h. Tout accès en dehors de ces horaires doit être signalé à la sécurité." },
    { id: 4, titre: "Utilisation des espaces", texte: "Les espaces loués doivent être utilisés conformément à leur destination (bureau, commerce, dépôt, stand). Toute modification nécessite une autorisation préalable." },
    { id: 5, titre: "Entretien et propreté", texte: "Chaque locataire est tenu de maintenir son espace en bon état de propreté. Les parties communes sont entretenues par le gestionnaire." },
    { id: 6, titre: "Gestion des déchets", texte: "Les déchets doivent être triés et déposés dans les conteneurs prévus à cet effet. Les déchets volumineux doivent être évacués par les services municipaux." },
    { id: 7, titre: "Stationnement", texte: "Le stationnement est réservé aux véhicules des locataires dans les emplacements attribués. Toute infraction est passible d'une amende." },
    { id: 8, titre: "Bruit et nuisances", texte: "Le niveau sonore doit rester raisonnable. Les travaux bruyants sont interdits avant 8h et après 18h, et le week-end." },
    { id: 9, titre: "Assurances", texte: "Chaque locataire doit souscrire une assurance responsabilité civile couvrant son activité et les dommages causés à l'immeuble." },
    { id: 10, titre: "Paiement des charges", texte: "Les charges locatives (eau, électricité, entretien, sécurité) sont réparties entre les locataires au prorata de la superficie occupée." },
    { id: 11, titre: "Modifications et travaux", texte: "Tout travaux d'aménagement ou de modification doit faire l'objet d'une demande écrite auprès du gestionnaire." },
    { id: 12, titre: "Résiliation et préavis", texte: "La résiliation du bail doit être notifiée par écrit avec un préavis de 3 mois. Tout manquement au règlement peut entraîner une résiliation anticipée." }
];

const Reglement = () => {
    const [expanded, setExpanded] = useState(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfContent, setPdfContent] = useState(null);

    const toggleExpand = (id) => {
        setExpanded(expanded === id ? null : id);
    };

    const genererPDFReglement = () => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const date = new Date().toLocaleDateString('fr-FR');

            // En-tête
            doc.setFontSize(18);
            doc.setTextColor(26, 95, 122);
            doc.text('RÈGLEMENT INTÉRIEUR', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Établi le ${date}`, 105, 28, { align: 'center' });

            doc.setDrawColor(200, 200, 200);
            doc.line(20, 32, 190, 32);

            doc.setFontSize(10);
            doc.setTextColor(50);
            let y = 42;

            // Contenu des articles
            REGLEMENT.forEach((art) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.setFont('helvetica', 'bold');
                doc.text(`Article ${art.id} - ${art.titre}`, 20, y);
                doc.setFont('helvetica', 'normal');
                y += 6;
                const textLines = doc.splitTextToSize(art.texte, 160);
                doc.text(textLines, 25, y);
                y += textLines.length * 5 + 5;
            });

            // Signature
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text('Fait à Casablanca, le ' + date, 105, y + 15, { align: 'center' });
            doc.text('Le gestionnaire', 105, y + 25, { align: 'center' });

            doc.save('reglement_interieur.pdf');
            toast.success('PDF du règlement généré avec succès');
        } catch (error) {
            toast.error('Erreur lors de la génération du PDF');
            console.error(error);
        }
    };

    const apercuPDFReglement = () => {
        try {
            const date = new Date().toLocaleDateString('fr-FR');
            setPdfContent({ date });
            setPdfModalOpen(true);
        } catch (error) {
            toast.error('Erreur lors de l\'aperçu');
            console.error(error);
        }
    };

    const closePdfModal = () => {
        setPdfModalOpen(false);
        setPdfContent(null);
    };

    const getArticleIcon = (id) => {
        const icons = {
            1: 'fa-home',
            2: 'fa-shield-alt',
            3: 'fa-clock',
            4: 'fa-building',
            5: 'fa-broom',
            6: 'fa-trash',
            7: 'fa-car',
            8: 'fa-volume-up',
            9: 'fa-shield-halved',
            10: 'fa-money-bill',
            11: 'fa-hammer',
            12: 'fa-handshake'
        };
        return icons[id] || 'fa-file-lines';
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                    <i className="fas fa-gavel" style={{ color: '#1a5f7a', marginRight: '10px' }}></i>
                    Règlement intérieur
                </h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    Règles de vie et de fonctionnement de l'immeuble
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                    <i className="fas fa-file-lines" style={{ marginRight: '6px' }}></i>
                    {REGLEMENT.length} articles
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                        className="btn btn-gold" 
                        onClick={genererPDFReglement}
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            fontWeight: '500', 
                            fontSize: '13px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            background: '#d4a843', 
                            color: '#fff',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#b8942e'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#d4a843'}
                    >
                        <i className="fas fa-file-pdf"></i> Exporter PDF
                    </button>
                    <button 
                        className="btn btn-info" 
                        onClick={apercuPDFReglement}
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            fontWeight: '500', 
                            fontSize: '13px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            background: '#3b82f6', 
                            color: '#fff',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                    >
                        <i className="fas fa-eye"></i> Aperçu
                    </button>
                </div>
            </div>

            <div className="card" style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
                <div style={{ 
                    background: '#f8fafc', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    marginBottom: '20px', 
                    borderLeft: '4px solid #d4a843',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>
                        <i className="fas fa-file-alt" style={{ marginRight: '8px', color: '#d4a843' }}></i>
                        Règlement intérieur de l'immeuble - {new Date().getFullYear()}
                    </p>
                    <span style={{ color: '#94a3b8', fontSize: '12px', background: '#fff', padding: '2px 12px', borderRadius: '12px' }}>
                        {REGLEMENT.length} articles
                    </span>
                </div>

                {REGLEMENT.map((art) => {
                    const icon = getArticleIcon(art.id);
                    const isExpanded = expanded === art.id;
                    return (
                        <div 
                            key={art.id} 
                            style={{ 
                                marginBottom: '12px', 
                                paddingBottom: '12px', 
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                borderRadius: '8px',
                                padding: isExpanded ? '12px 16px' : '8px 12px',
                                background: isExpanded ? '#f8fafc' : 'transparent'
                            }}
                            onClick={() => toggleExpand(art.id)}
                            onMouseEnter={(e) => {
                                if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                                if (!isExpanded) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: isExpanded ? '#1a5f7a' : '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isExpanded ? '#fff' : '#64748b',
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}>
                                    <i className={`fas ${icon}`}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{ 
                                            background: '#1a5f7a', 
                                            color: '#fff', 
                                            padding: '2px 10px', 
                                            borderRadius: '4px', 
                                            fontSize: '10px', 
                                            fontWeight: '600'
                                        }}>
                                            Art. {art.id}
                                        </span>
                                        <h3 style={{ 
                                            fontSize: '15px', 
                                            fontWeight: isExpanded ? '600' : '500', 
                                            color: isExpanded ? '#1a5f7a' : '#1e293b',
                                            transition: 'all 0.2s'
                                        }}>
                                            {art.titre}
                                        </h3>
                                    </div>
                                </div>
                                <span style={{ 
                                    fontSize: '12px', 
                                    color: '#94a3b8',
                                    transition: 'all 0.2s',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}>
                                    <i className="fas fa-chevron-down"></i>
                                </span>
                            </div>
                            <div style={{
                                maxHeight: isExpanded ? '200px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease, opacity 0.3s ease',
                                opacity: isExpanded ? 1 : 0
                            }}>
                                <p style={{ 
                                    fontSize: '13px', 
                                    color: '#475569', 
                                    marginTop: '10px', 
                                    paddingLeft: '44px',
                                    lineHeight: '1.6'
                                }}>
                                    {art.texte}
                                </p>
                            </div>
                            {!isExpanded && (
                                <p style={{ 
                                    fontSize: '11px', 
                                    color: '#94a3b8', 
                                    paddingLeft: '44px',
                                    marginTop: '4px'
                                }}>
                                    <i className="fas fa-chevron-down" style={{ fontSize: '8px', marginRight: '4px' }}></i>
                                    Cliquez pour développer
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

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
                                Aperçu du règlement intérieur
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
                                    RÈGLEMENT INTÉRIEUR
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                    Établi le {pdfContent.date}
                                </div>
                                <hr style={{ borderColor: '#e2e8f0', marginBottom: '12px' }} />
                                {REGLEMENT.map((art) => (
                                    <div key={art.id} style={{ marginBottom: '12px' }}>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            fontSize: '13px', 
                                            color: '#1a5f7a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ 
                                                background: '#1a5f7a', 
                                                color: '#fff', 
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '10px'
                                            }}>
                                                Art. {art.id}
                                            </span>
                                            {art.titre}
                                        </div>
                                        <p style={{ 
                                            fontSize: '12px', 
                                            color: '#475569', 
                                            marginTop: '4px', 
                                            paddingLeft: '44px',
                                            lineHeight: '1.6'
                                        }}>
                                            {art.texte}
                                        </p>
                                    </div>
                                ))}
                                <div className="pdf-signature" style={{ 
                                    marginTop: '16px', 
                                    textAlign: 'center', 
                                    fontSize: '12px', 
                                    color: '#64748b',
                                    borderTop: '1px solid #e2e8f0',
                                    paddingTop: '12px'
                                }}>
                                    Fait à Casablanca, le {pdfContent.date}<br />
                                    Le gestionnaire
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
                            <button className="btn btn-gold" onClick={() => { closePdfModal(); genererPDFReglement(); }} style={{ 
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
export default Reglement;