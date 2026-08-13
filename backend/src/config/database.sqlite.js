// backend/src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const path = require('path');

let db = null;

async function getDb() {
    if (db) return db;
    db = await sqlite.open({
        filename: path.join(__dirname, '../../', process.env.DB_PATH || 'database.sqlite'),
        driver: sqlite3.Database,
    });
    await initTables();
    return db;
}

async function initTables() {
    const db = await getDb();
    
    // Users
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'consultation',
            actif INTEGER DEFAULT 1,
            dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
            derniereConnexion DATETIME
        )
    `);
    
    // Sites (créé en premier car espaces en dépend)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            adresse TEXT,
            ville TEXT,
            codePostal TEXT,
            pays TEXT DEFAULT 'Maroc',
            latitude REAL,
            longitude REAL,
            description TEXT,
            actif INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Etages
    await db.exec(`
        CREATE TABLE IF NOT EXISTS etages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            siteId INTEGER NOT NULL,
            nom TEXT NOT NULL,
            niveau INTEGER DEFAULT 0,
            description TEXT,
            actif INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (siteId) REFERENCES sites(id)
        )
    `);
    
    // Espaces avec siteId et etage
    await db.exec(`
        CREATE TABLE IF NOT EXISTS espaces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT UNIQUE NOT NULL,
            designation TEXT NOT NULL,
            type TEXT DEFAULT 'bureau',
            superficie REAL NOT NULL,
            etage TEXT DEFAULT 'RC',
            siteId INTEGER,
            positionX INTEGER DEFAULT 30,
            positionY INTEGER DEFAULT 30,
            largeur INTEGER DEFAULT 120,
            hauteur INTEGER DEFAULT 80,
            couleur TEXT DEFAULT '#94a3b8',
            loyerReference REAL DEFAULT 0,
            chargesReference REAL DEFAULT 0,
            statut TEXT DEFAULT 'disponible',
            contratActifId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contratActifId) REFERENCES contrats(id),
            FOREIGN KEY (siteId) REFERENCES sites(id)
        )
    `);
    
    // Locataires
    await db.exec(`
        CREATE TABLE IF NOT EXISTS locataires (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            nomComplet TEXT NOT NULL,
            cin TEXT UNIQUE,
            ice TEXT UNIQUE,
            registreCommerce TEXT,
            identifiantFiscal TEXT,
            adresse TEXT,
            telephone TEXT NOT NULL,
            email TEXT,
            representantLegal TEXT,
            dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
            creePar INTEGER,
            FOREIGN KEY (creePar) REFERENCES users(id)
        )
    `);
    
    // Contrats
    await db.exec(`
        CREATE TABLE IF NOT EXISTS contrats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            espaceId INTEGER NOT NULL,
            locataireId INTEGER NOT NULL,
            statut TEXT DEFAULT 'brouillon_import',
            dateSignature DATETIME,
            dateDebut DATETIME NOT NULL,
            dateFin DATETIME NOT NULL,
            dureeMois INTEGER NOT NULL,
            renouvellementAuto INTEGER DEFAULT 0,
            delaiPreavisJours INTEGER DEFAULT 90,
            conditionsResiliation TEXT,
            montantLoyer REAL NOT NULL,
            periodicite TEXT DEFAULT 'mensuel',
            montantCharges REAL DEFAULT 0,
            montantCaution REAL NOT NULL,
            moisCaution INTEGER DEFAULT 3,
            avanceVersee REAL,
            modalitesPaiement TEXT,
            datePaiementPrevue DATETIME,
            penalitesRetard TEXT,
            obligationsParticulieres TEXT,
            assuranceObligatoire INTEGER DEFAULT 0,
            clauseResponsabiliteMarchandises INTEGER DEFAULT 0,
            importePar INTEGER,
            validePar INTEGER,
            dateImport DATETIME DEFAULT CURRENT_TIMESTAMP,
            dateValidation DATETIME,
            extraits TEXT,
            anomalies TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (espaceId) REFERENCES espaces(id),
            FOREIGN KEY (locataireId) REFERENCES locataires(id),
            FOREIGN KEY (importePar) REFERENCES users(id),
            FOREIGN KEY (validePar) REFERENCES users(id)
        )
    `);
    
    // Factures
    await db.exec(`
        CREATE TABLE IF NOT EXISTS factures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contratId INTEGER NOT NULL,
            locataireId INTEGER NOT NULL,
            numero TEXT UNIQUE NOT NULL,
            periodeDebut DATETIME NOT NULL,
            periodeFin DATETIME NOT NULL,
            montantLoyer REAL NOT NULL,
            montantCharges REAL DEFAULT 0,
            montantTotal REAL NOT NULL,
            dateEmission DATETIME DEFAULT CURRENT_TIMESTAMP,
            dateEcheance DATETIME NOT NULL,
            statut TEXT DEFAULT 'impayee',
            fichierPdf TEXT,
            motifAnnulation TEXT,
            avoirLieId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contratId) REFERENCES contrats(id),
            FOREIGN KEY (locataireId) REFERENCES locataires(id)
        )
    `);
    
    // Paiements
    await db.exec(`
        CREATE TABLE IF NOT EXISTS paiements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            factureId INTEGER NOT NULL,
            montant REAL NOT NULL,
            datePaiement DATETIME NOT NULL,
            mode TEXT NOT NULL,
            reference TEXT,
            justificatifFichier TEXT,
            enregistrePar INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (factureId) REFERENCES factures(id),
            FOREIGN KEY (enregistrePar) REFERENCES users(id)
        )
    `);
    
    // Cautions
    await db.exec(`
        CREATE TABLE IF NOT EXISTS cautions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contratId INTEGER NOT NULL,
            montantAttendu REAL NOT NULL,
            montantRecu REAL DEFAULT 0,
            modeReglement TEXT,
            dateVersement DATETIME,
            statut TEXT DEFAULT 'attendue',
            conditionsRemboursement TEXT,
            conditionsRetenue TEXT,
            justificatifFichier TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contratId) REFERENCES contrats(id)
        )
    `);
    
    // Alertes
    await db.exec(`
        CREATE TABLE IF NOT EXISTS alertes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            lu INTEGER DEFAULT 0,
            userId INTEGER,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);
    
    // Journal activite
    await db.exec(`
        CREATE TABLE IF NOT EXISTS journal_activite (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            action TEXT NOT NULL,
            entite TEXT,
            entiteId INTEGER,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            adresseIp TEXT,
            details TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `);
    
    // Insérer un site par défaut si aucun n'existe
    const siteCount = await db.get('SELECT COUNT(*) as count FROM sites');
    if (siteCount.count === 0) {
        await db.run(`
            INSERT INTO sites (nom, adresse, ville, pays, latitude, longitude, description) 
            VALUES ('Siège Social', '1 Rue de la Paix', 'Casablanca', 'Maroc', 33.5731, -7.5898, 'Site principal')
        `);
        console.log('✅ Site par défaut créé');
    }
    
    // Insérer des étages par défaut
    const site = await db.get('SELECT id FROM sites LIMIT 1');
    if (site) {
        const etageCount = await db.get('SELECT COUNT(*) as count FROM etages WHERE siteId = ?', [site.id]);
        if (etageCount.count === 0) {
            const etages = ['RC', '1', '2', '3'];
            for (const [index, nom] of etages.entries()) {
                await db.run(
                    `INSERT INTO etages (siteId, nom, niveau, description) VALUES (?, ?, ?, ?)`,
                    [site.id, nom, index, `Étage ${nom}`]
                );
            }
            console.log('✅ Étages par défaut créés');
        }
    }
    
    console.log('✅ Database initialized successfully');
}

module.exports = { getDb, initTables };