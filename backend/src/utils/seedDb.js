require('dotenv').config();
// backend/src/utils/seedDb.js

const { getDb, initTables } = require('../config/database');

/**
 * Seed de la base de données
 * Crée des données de démonstration pour le développement
 */
async function seedDatabase() {
    try {
        console.log('🌱 Seed de la base de données...');

        // Initialiser les tables
        await initTables();

        const db = await getDb();

        // 1. Vérifier si des utilisateurs existent déjà
        const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
        if (existingUsers && existingUsers.count > 0) {
            console.log('⚠️ Des utilisateurs existent déjà, skip seed');
            return;
        }

        // 2. Créer les utilisateurs
        const adminResult = await db.run(`
            INSERT INTO users (
                nom, email, password, role, actif, "dateCreation"
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            'Administrateur',
            'admin@loc.fr',
            '$2a$10$H7zPZq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7', // password: admin123
            'admin',
            1,
            new Date().toISOString()
        ]);
        console.log('✅ Admin créé');

        const gestionnaireResult = await db.run(`
            INSERT INTO users (
                nom, email, password, role, actif, "dateCreation"
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            'Gestionnaire',
            'gestionnaire@loc.fr',
            '$2a$10$H7zPZq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7',
            'gestionnaire',
            1,
            new Date().toISOString()
        ]);
        console.log('✅ Gestionnaire créé');

        const comptableResult = await db.run(`
            INSERT INTO users (
                nom, email, password, role, actif, "dateCreation"
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            'Comptable',
            'comptable@loc.fr',
            '$2a$10$H7zPZq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7Zq7',
            'comptable',
            1,
            new Date().toISOString()
        ]);
        console.log('✅ Comptable créé');

        // 3. Récupérer l'ID du site par défaut
        const site = await db.get('SELECT id FROM sites WHERE nom = ?', 'Site Principal');
        if (!site) {
            console.log('⚠️ Site principal non trouvé, création...');
            const siteResult = await db.run(`
                INSERT INTO sites (nom, adresse, ville, pays, actif)
                VALUES (?, ?, ?, ?, ?)
            `, ['Site Principal', '123 Rue Principale', 'Casablanca', 'Maroc', 1]);
            siteId = siteResult.lastID;
        } else {
            var siteId = site.id;
        }

        console.log(`✅ Site ID: ${siteId}`);

        // 4. Récupérer l'ID de l'étage RC
        const etage = await db.get(`
            SELECT id FROM etages 
            WHERE "siteId" = ? AND nom = ?
        `, [siteId, 'RC']);
        if (!etage) {
            console.log('⚠️ Étage RC non trouvé');
            return;
        }
        const etageId = etage.id;

        // 5. Créer un locataire
        const locataireResult = await db.run(`
            INSERT INTO locataires (
                type,
                "nomComplet",   -- ← Attention : guillemets pour camelCase !
                telephone,
                email,
                adresse,
                "dateCreation",
                "creePar"
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            'particulier',
            'Jean Dupont',      // ← nomComplet, pas nomcomplet
            '0612345678',
            'jean.dupont@email.com',
            '45 Rue des Lilas, Casablanca',
            new Date().toISOString(),
            1 // adminId
        ]);
        console.log('✅ Locataire créé');

        // 6. Créer un espace
        const espaceResult = await db.run(`
            INSERT INTO espaces (
                numero,
                designation,
                type,
                superficie,
                etage,
                "siteId",
                statut,
                "createdAt",
                "updatedAt"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'A101',
            'Bureau A101',
            'bureau',
            45.5,
            'RC',
            siteId,
            'disponible',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        console.log('✅ Espace créé');

        // 7. Créer un contrat
        const contratResult = await db.run(`
            INSERT INTO contrats (
                "espaceId",
                "locataireId",
                statut,
                "dateDebut",
                "dateFin",
                "dureeMois",
                "renouvellementAuto",
                "delaiPreavisJours",
                "montantLoyer",
                periodicite,
                "montantCharges",
                "montantCaution",
                "moisCaution",
                "createdAt",
                "updatedAt"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            espaceResult.lastID,
            locataireResult.lastID,
            'actif',
            new Date().toISOString(),
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 an
            12,
            1,
            90,
            1500.00,
            'mensuel',
            200.00,
            4500.00,
            3,
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        console.log('✅ Contrat créé');

        // 8. Mettre à jour l'espace avec le contrat actif
        await db.run(`
            UPDATE espaces 
            SET "contratActifId" = ?, statut = ?
            WHERE id = ?
        `, [contratResult.lastID, 'loue', espaceResult.lastID]);
        console.log('✅ Espace mis à jour avec contrat actif');

        // 9. Créer une facture
        const factureResult = await db.run(`
            INSERT INTO factures (
                "contratId",
                "locataireId",
                numero,
                "periodeDebut",
                "periodeFin",
                "montantLoyer",
                "montantCharges",
                "montantTotal",
                "dateEmission",
                "dateEcheance",
                statut,
                "createdAt",
                "updatedAt"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            contratResult.lastID,
            locataireResult.lastID,
            'F2024-001',
            new Date().toISOString(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            1500.00,
            200.00,
            1700.00,
            new Date().toISOString(),
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            'impayee',
            new Date().toISOString(),
            new Date().toISOString()
        ]);
        console.log('✅ Facture créée');

        console.log('✅ Seed terminé avec succès');
        console.log('📊 Données créées:');
        console.log(`  - ${3} utilisateurs`);
        console.log(`  - ${1} site`);
        console.log(`  - ${1} locataire`);
        console.log(`  - ${1} espace`);
        console.log(`  - ${1} contrat`);
        console.log(`  - ${1} facture`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    }
}

// Exécution directe
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = seedDatabase;