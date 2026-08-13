const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        const db = await getDb();
        console.log('🌱 Seed de la base de données...');

        // 1. Créer un utilisateur admin
        const adminEmail = 'admin@loc.fr';
        const adminPassword = 'admin123';
        const adminHash = await bcrypt.hash(adminPassword, 10);
        
        let adminId;
        const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', adminEmail);
        if (!existingAdmin) {
            const result = await db.run(
                'INSERT INTO users (nom, email, password, role, actif) VALUES (?, ?, ?, ?, ?)',
                ['Administrateur', adminEmail, adminHash, 'admin', 1]
            );
            adminId = result.lastID;
            console.log('✅ Admin créé');
        } else {
            adminId = existingAdmin.id;
            console.log('ℹ️  Admin existe déjà');
        }

        // 2. Créer un gestionnaire
        const gestEmail = 'gest@loc.fr';
        const gestPassword = 'gest123';
        const gestHash = await bcrypt.hash(gestPassword, 10);
        
        let gestId;
        const existingGest = await db.get('SELECT id FROM users WHERE email = ?', gestEmail);
        if (!existingGest) {
            const result = await db.run(
                'INSERT INTO users (nom, email, password, role, actif) VALUES (?, ?, ?, ?, ?)',
                ['Gestionnaire', gestEmail, gestHash, 'gestionnaire', 1]
            );
            gestId = result.lastID;
            console.log('✅ Gestionnaire créé');
        } else {
            gestId = existingGest.id;
            console.log('ℹ️  Gestionnaire existe déjà');
        }

        // 3. Créer un comptable
        const compEmail = 'compta@loc.fr';
        const compPassword = 'compta123';
        const compHash = await bcrypt.hash(compPassword, 10);
        
        let compId;
        const existingComp = await db.get('SELECT id FROM users WHERE email = ?', compEmail);
        if (!existingComp) {
            const result = await db.run(
                'INSERT INTO users (nom, email, password, role, actif) VALUES (?, ?, ?, ?, ?)',
                ['Comptable', compEmail, compHash, 'comptable', 1]
            );
            compId = result.lastID;
            console.log('✅ Comptable créé');
        } else {
            compId = existingComp.id;
            console.log('ℹ️  Comptable existe déjà');
        }

        // 4. Créer des locataires
        const locataires = [
            { type: 'societe', nomComplet: 'SARL IMMO PLUS', cin: 'AB123456', ice: '123456789012345', telephone: '0612345678', email: 'contact@immoplus.ma', creePar: adminId },
            { type: 'societe', nomComplet: 'MEGA STORE SARL', cin: 'CD789012', ice: '987654321098765', telephone: '0623456789', email: 'contact@megastore.ma', creePar: adminId },
            { type: 'personne_physique', nomComplet: 'Karim El Fassi', cin: 'EF345678', telephone: '0634567890', email: 'karim.elfassi@email.ma', creePar: adminId },
            { type: 'personne_physique', nomComplet: 'Fatima Zahra', cin: 'GH901234', telephone: '0645678901', email: 'fatima.zahra@email.ma', creePar: adminId },
        ];

        const locataireIds = [];
        for (const loc of locataires) {
            const existing = await db.get('SELECT id FROM locataires WHERE cin = ?', loc.cin);
            if (!existing) {
                const result = await db.run(
                    `INSERT INTO locataires (type, nomComplet, cin, ice, telephone, email, creePar) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [loc.type, loc.nomComplet, loc.cin, loc.ice, loc.telephone, loc.email, loc.creePar]
                );
                locataireIds.push(result.lastID);
                console.log('✅ Locataire créé:', loc.nomComplet);
            } else {
                locataireIds.push(existing.id);
                console.log('ℹ️  Locataire existe déjà:', loc.nomComplet);
            }
        }

        // 5. Créer des espaces
        const espaces = [
            { numero: 'A101', designation: 'Boutique Or', type: 'boutique', superficie: 45, etage: 'RC', positionX: 30, positionY: 30, largeur: 130, hauteur: 90, couleur: '#f59e0b', loyerReference: 4500, statut: 'occupe' },
            { numero: 'A102', designation: 'Boutique Argent', type: 'boutique', superficie: 38, etage: 'RC', positionX: 180, positionY: 30, largeur: 120, hauteur: 90, couleur: '#94a3b8', loyerReference: 3800, statut: 'occupe' },
            { numero: 'B201', designation: 'Entrepôt Central', type: 'depot', superficie: 120, etage: 'RC', positionX: 30, positionY: 140, largeur: 200, hauteur: 110, couleur: '#3b82f6', loyerReference: 8000, statut: 'disponible' },
            { numero: 'B202', designation: 'Dépôt Secondaire', type: 'depot', superficie: 75, etage: 'RC', positionX: 250, positionY: 140, largeur: 150, hauteur: 100, couleur: '#60a5fa', loyerReference: 5500, statut: 'disponible' },
            { numero: 'C301', designation: 'Bureau Direction', type: 'bureau', superficie: 30, etage: '1', positionX: 30, positionY: 30, largeur: 120, hauteur: 80, couleur: '#10b981', loyerReference: 3200, statut: 'occupe' },
            { numero: 'C302', designation: 'Bureau Comptable', type: 'bureau', superficie: 25, etage: '1', positionX: 170, positionY: 30, largeur: 110, hauteur: 80, couleur: '#34d399', loyerReference: 2500, statut: 'travaux' },
            { numero: 'D401', designation: 'Stand Expo A', type: 'stand', superficie: 20, etage: '2', positionX: 30, positionY: 30, largeur: 100, hauteur: 70, couleur: '#8b5cf6', loyerReference: 1800, statut: 'disponible' },
            { numero: 'D402', designation: 'Stand Expo B', type: 'stand', superficie: 18, etage: '2', positionX: 150, positionY: 30, largeur: 90, hauteur: 70, couleur: '#a78bfa', loyerReference: 1600, statut: 'disponible' },
        ];

        const espaceIds = [];
        for (const esp of espaces) {
            const existing = await db.get('SELECT id FROM espaces WHERE numero = ?', esp.numero);
            if (!existing) {
                const result = await db.run(
                    `INSERT INTO espaces (numero, designation, type, superficie, etage, positionX, positionY, largeur, hauteur, couleur, loyerReference, statut) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [esp.numero, esp.designation, esp.type, esp.superficie, esp.etage, esp.positionX, esp.positionY, esp.largeur, esp.hauteur, esp.couleur, esp.loyerReference, esp.statut]
                );
                espaceIds.push(result.lastID);
                console.log('✅ Espace créé:', esp.numero);
            } else {
                espaceIds.push(existing.id);
                console.log('ℹ️  Espace existe déjà:', esp.numero);
            }
        }

        // 6. Créer des contrats
        const contrats = [
            { espaceId: espaceIds[0], locataireId: locataireIds[0], statut: 'actif', dateDebut: '2026-01-01', dateFin: '2028-12-31', dureeMois: 36, montantLoyer: 4500, montantCaution: 13500, importePar: adminId },
            { espaceId: espaceIds[1], locataireId: locataireIds[1], statut: 'actif', dateDebut: '2026-03-01', dateFin: '2029-02-28', dureeMois: 36, montantLoyer: 3800, montantCaution: 11400, importePar: adminId },
            { espaceId: espaceIds[4], locataireId: locataireIds[2], statut: 'actif', dateDebut: '2026-06-01', dateFin: '2029-05-31', dureeMois: 36, montantLoyer: 3200, montantCaution: 9600, importePar: adminId },
        ];

        const contratIds = [];
        for (const c of contrats) {
            const existing = await db.get('SELECT id FROM contrats WHERE espaceId = ? AND locataireId = ?', [c.espaceId, c.locataireId]);
            if (!existing) {
                const result = await db.run(
                    `INSERT INTO contrats (espaceId, locataireId, statut, dateDebut, dateFin, dureeMois, montantLoyer, montantCaution, importePar) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [c.espaceId, c.locataireId, c.statut, c.dateDebut, c.dateFin, c.dureeMois, c.montantLoyer, c.montantCaution, c.importePar]
                );
                contratIds.push(result.lastID);
                console.log('✅ Contrat créé #', result.lastID);
                
                // Mettre à jour l'espace comme occupé
                await db.run('UPDATE espaces SET statut = ?, contratActifId = ? WHERE id = ?', ['occupe', result.lastID, c.espaceId]);
            } else {
                contratIds.push(existing.id);
                console.log('ℹ️  Contrat existe déjà #', existing.id);
            }
        }

        // 7. Créer des factures
        const factures = [
            { contratId: contratIds[0], locataireId: locataireIds[0], numero: 'F2026-001', periodeDebut: '2026-01-01', periodeFin: '2026-01-31', montantLoyer: 4500, montantCharges: 300, montantTotal: 4800, dateEcheance: '2026-01-31', statut: 'payee' },
            { contratId: contratIds[0], locataireId: locataireIds[0], numero: 'F2026-002', periodeDebut: '2026-02-01', periodeFin: '2026-02-28', montantLoyer: 4500, montantCharges: 300, montantTotal: 4800, dateEcheance: '2026-02-28', statut: 'impayee' },
            { contratId: contratIds[1], locataireId: locataireIds[1], numero: 'F2026-003', periodeDebut: '2026-03-01', periodeFin: '2026-03-31', montantLoyer: 3800, montantCharges: 250, montantTotal: 4050, dateEcheance: '2026-03-31', statut: 'payee' },
        ];

        for (const f of factures) {
            const existing = await db.get('SELECT id FROM factures WHERE numero = ?', f.numero);
            if (!existing) {
                await db.run(
                    `INSERT INTO factures (contratId, locataireId, numero, periodeDebut, periodeFin, montantLoyer, montantCharges, montantTotal, dateEcheance, statut) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [f.contratId, f.locataireId, f.numero, f.periodeDebut, f.periodeFin, f.montantLoyer, f.montantCharges, f.montantTotal, f.dateEcheance, f.statut]
                );
                console.log('✅ Facture créée:', f.numero);
            } else {
                console.log('ℹ️  Facture existe déjà:', f.numero);
            }
        }

        // 8. Créer des paiements
        const paiements = [
            { factureId: 1, montant: 4800, datePaiement: '2026-01-28', mode: 'virement', reference: 'VIR001', enregistrePar: adminId },
            { factureId: 3, montant: 4050, datePaiement: '2026-03-25', mode: 'cheque', reference: 'CHQ003', enregistrePar: adminId },
        ];

        for (const p of paiements) {
            const existing = await db.get('SELECT id FROM paiements WHERE reference = ?', p.reference);
            if (!existing) {
                await db.run(
                    `INSERT INTO paiements (factureId, montant, datePaiement, mode, reference, enregistrePar) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [p.factureId, p.montant, p.datePaiement, p.mode, p.reference, p.enregistrePar]
                );
                console.log('✅ Paiement créé:', p.reference);
            } else {
                console.log('ℹ️  Paiement existe déjà:', p.reference);
            }
        }

        // 9. Créer des cautions
        const cautions = [
            { contratId: contratIds[0], montantAttendu: 13500, montantRecu: 13500, statut: 'recue', dateVersement: '2026-01-10', modeReglement: 'virement' },
            { contratId: contratIds[1], montantAttendu: 11400, montantRecu: 11400, statut: 'recue', dateVersement: '2026-02-25', modeReglement: 'cheque' },
        ];

        for (const c of cautions) {
            const existing = await db.get('SELECT id FROM cautions WHERE contratId = ?', c.contratId);
            if (!existing) {
                await db.run(
                    `INSERT INTO cautions (contratId, montantAttendu, montantRecu, statut, dateVersement, modeReglement) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [c.contratId, c.montantAttendu, c.montantRecu, c.statut, c.dateVersement, c.modeReglement]
                );
                console.log('✅ Caution créée pour contrat #', c.contratId);
            } else {
                console.log('ℹ️  Caution existe déjà pour contrat #', c.contratId);
            }
        }

        // 10. Créer des alertes
        const alertes = [
            { type: 'echeance', message: 'Contrat #1 : fin le 31/12/2028', userId: adminId },
            { type: 'impaye', message: 'Facture F2026-002 impayée', userId: adminId },
            { type: 'info', message: 'Espace B201 disponible à la location', userId: adminId },
        ];

        for (const a of alertes) {
            await db.run(
                `INSERT INTO alertes (type, message, userId) VALUES (?, ?, ?)`,
                [a.type, a.message, a.userId]
            );
            console.log('✅ Alerte créée:', a.type);
        }

        console.log('🎉 Base de données initialisée avec succès !');
        console.log('📊 Comptes de démonstration:');
        console.log('   admin@loc.fr / admin123');
        console.log('   gest@loc.fr / gest123');
        console.log('   compta@loc.fr / compta123');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

seedDatabase();