// backend/src/config/database.js

const { Pool } = require('pg');

let pool = null;
let initializationPromise = null;
let isInitialized = false;

// Configuration de la connexion
function getPoolConfig() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }

    const config = {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    };

    // SSL config selon environnement
    if (process.env.NODE_ENV === 'production') {
        config.ssl = {
            rejectUnauthorized: false
        };
    } else if (process.env.DATABASE_URL.includes('localhost') || 
               process.env.DATABASE_URL.includes('127.0.0.1')) {
        // Pas de SSL en local
    } else {
        // SSL pour les bases externes (Supabase, etc.)
        config.ssl = {
            rejectUnauthorized: false
        };
    }

    return config;
}

function getPool() {
    if (pool) return pool;
    pool = new Pool(getPoolConfig());
    return pool;
}

/**
 * Normalise les paramètres en tableau
 * Supporte: params simple, params tableau, params objet
 */
function normalizeParams(params) {
    if (params === undefined || params === null) {
        return [];
    }
    if (Array.isArray(params)) {
        return params;
    }
    // Paramètre unique
    return [params];
}

/**
 * Convertit les placeholders SQLite ? en PostgreSQL $1, $2...
 * Version robuste qui évite de casser les strings SQL
 */
function convertPlaceholders(sql) {
    let index = 0;
    let insideString = false;
    let stringChar = '';
    let result = '';
    
    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        
        // Gestion des strings
        if (char === "'" || char === '"') {
            if (!insideString) {
                insideString = true;
                stringChar = char;
            } else if (char === stringChar) {
                insideString = false;
                stringChar = '';
            }
            result += char;
            continue;
        }
        
        // Ne pas convertir les ? dans les strings
        if (insideString) {
            result += char;
            continue;
        }
        
        if (char === '?') {
            index++;
            result += `$${index}`;
        } else {
            result += char;
        }
    }
    
    return result;
}

/**
 * Vérifie si une requête est une insertion
 */
function isInsertQuery(sql) {
    return /^\s*INSERT\s+/i.test(sql);
}

/**
 * Ajoute RETURNING id aux INSERT si absent
 */
function addReturningId(sql) {
    if (isInsertQuery(sql) && !/\bRETURNING\b/i.test(sql)) {
        return sql + ' RETURNING id';
    }
    return sql;
}

/**
 * Interface compatible avec les anciens modèles SQLite
 */
async function getDb() {
    const pool = getPool();

    return {
        /**
         * db.get(sql, params) - Retourne une ligne
         * Supporte: db.get(sql, 'value') et db.get(sql, ['value'])
         */
        async get(sql, params = []) {
            try {
                const normalizedParams = normalizeParams(params);
                const query = convertPlaceholders(sql);
                const result = await pool.query(query, normalizedParams);
                return result.rows[0] || null;
            } catch (error) {
                console.error('db.get error:', error);
                throw error;
            }
        },

        /**
         * db.all(sql, params) - Retourne toutes les lignes
         * Supporte: db.all(sql, 'value') et db.all(sql, ['value'])
         */
        async all(sql, params = []) {
            try {
                const normalizedParams = normalizeParams(params);
                const query = convertPlaceholders(sql);
                const result = await pool.query(query, normalizedParams);
                return result.rows;
            } catch (error) {
                console.error('db.all error:', error);
                throw error;
            }
        },

        /**
         * db.run(sql, params) - Exécute et retourne lastID
         * Supporte: db.run(sql, 'value') et db.run(sql, ['value'])
         */
        async run(sql, params = []) {
            try {
                const normalizedParams = normalizeParams(params);
                let query = convertPlaceholders(sql);
                query = addReturningId(query);
                
                const result = await pool.query(query, normalizedParams);
                
                return {
                    lastID: result.rows[0]?.id || null,
                    changes: result.rowCount || 0
                };
            } catch (error) {
                console.error('db.run error:', error);
                throw error;
            }
        },

        /**
         * db.exec(sql) - Exécute une requête sans paramètres
         */
        async exec(sql) {
            try {
                const result = await pool.query(sql);
                return result;
            } catch (error) {
                console.error('db.exec error:', error);
                throw error;
            }
        },

        /**
         * Transaction support
         */
        async transaction(callback) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const result = await callback(client);
                await client.query('COMMIT');
                return result;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }
    };
}

/**
 * Création des tables PostgreSQL avec gestion des dépendances circulaires
 */
async function initTables() {
    // Éviter les appels concurrents
    if (initializationPromise) {
        return initializationPromise;
    }

    if (isInitialized) {
        return;
    }

    initializationPromise = (async () => {
        const pool = getPool();

        try {
            // 1. Tables sans dépendances
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    nom TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT DEFAULT 'consultation',
                    actif INTEGER DEFAULT 1,
                    "dateCreation" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "derniereConnexion" TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS sites (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    nom TEXT NOT NULL,
                    adresse TEXT,
                    ville TEXT,
                    "codePostal" TEXT,
                    pays TEXT DEFAULT 'Maroc',
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    description TEXT,
                    actif INTEGER DEFAULT 1,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS etages (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    "siteId" INTEGER NOT NULL,
                    nom TEXT NOT NULL,
                    niveau INTEGER DEFAULT 0,
                    description TEXT,
                    actif INTEGER DEFAULT 1,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("siteId") REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS locataires (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    type TEXT NOT NULL,
                    "nomComplet" TEXT NOT NULL,
                    cin TEXT UNIQUE,
                    ice TEXT UNIQUE,
                    "registreCommerce" TEXT,
                    "identifiantFiscal" TEXT,
                    adresse TEXT,
                    telephone TEXT NOT NULL,
                    email TEXT,
                    "representantLegal" TEXT,
                    "dateCreation" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "creePar" INTEGER,
                    FOREIGN KEY ("creePar") REFERENCES users(id)
                )
            `);

            // 2. Espaces - SANS contratActifId pour éviter la dépendance circulaire
            await pool.query(`
                CREATE TABLE IF NOT EXISTS espaces (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    numero TEXT UNIQUE NOT NULL,
                    designation TEXT NOT NULL,
                    type TEXT DEFAULT 'bureau',
                    superficie DECIMAL(10, 2) NOT NULL,
                    etage TEXT DEFAULT 'RC',
                    "siteId" INTEGER,
                    "positionX" INTEGER DEFAULT 30,
                    "positionY" INTEGER DEFAULT 30,
                    largeur INTEGER DEFAULT 120,
                    hauteur INTEGER DEFAULT 80,
                    couleur TEXT DEFAULT '#94a3b8',
                    "loyerReference" DECIMAL(12, 2) DEFAULT 0,
                    "chargesReference" DECIMAL(12, 2) DEFAULT 0,
                    statut TEXT DEFAULT 'disponible',
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("siteId") REFERENCES sites(id) ON DELETE CASCADE
                )
            `);

            // 3. Contrats - référence espaces (maintenant disponible)
            await pool.query(`
                CREATE TABLE IF NOT EXISTS contrats (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    "espaceId" INTEGER NOT NULL,
                    "locataireId" INTEGER NOT NULL,
                    statut TEXT DEFAULT 'brouillon_import',
                    "dateSignature" TIMESTAMP,
                    "dateDebut" TIMESTAMP NOT NULL,
                    "dateFin" TIMESTAMP NOT NULL,
                    "dureeMois" INTEGER NOT NULL,
                    "renouvellementAuto" INTEGER DEFAULT 0,
                    "delaiPreavisJours" INTEGER DEFAULT 90,
                    "conditionsResiliation" TEXT,
                    "montantLoyer" DECIMAL(12, 2) NOT NULL,
                    periodicite TEXT DEFAULT 'mensuel',
                    "montantCharges" DECIMAL(12, 2) DEFAULT 0,
                    "montantCaution" DECIMAL(12, 2) NOT NULL,
                    "moisCaution" INTEGER DEFAULT 3,
                    "avanceVersee" DECIMAL(12, 2),
                    "modalitesPaiement" TEXT,
                    "datePaiementPrevue" TIMESTAMP,
                    "penalitesRetard" TEXT,
                    "obligationsParticulieres" TEXT,
                    "assuranceObligatoire" INTEGER DEFAULT 0,
                    "clauseResponsabiliteMarchandises" INTEGER DEFAULT 0,
                    "importePar" INTEGER,
                    "validePar" INTEGER,
                    "dateImport" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "dateValidation" TIMESTAMP,
                    extraits TEXT,
                    anomalies TEXT,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("espaceId") REFERENCES espaces(id) ON DELETE CASCADE,
                    FOREIGN KEY ("locataireId") REFERENCES locataires(id) ON DELETE CASCADE,
                    FOREIGN KEY ("importePar") REFERENCES users(id),
                    FOREIGN KEY ("validePar") REFERENCES users(id)
                )
            `);

            // 4. Ajout de la FK contratActifId sur espaces (maintenant que contrats existe)
  await pool.query(`
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_class t ON t.oid = c.conrelid
            WHERE t.relname = 'espaces'
              AND lower(c.conname) = lower('espaces_contratActifId_fkey')
        ) THEN
            ALTER TABLE espaces
            ADD CONSTRAINT espaces_contratActifId_fkey
            FOREIGN KEY ("contratActifId")
            REFERENCES contrats(id);
        END IF;
    END $$;
`);

            // 5. Autres tables
            await pool.query(`
                CREATE TABLE IF NOT EXISTS factures (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    "contratId" INTEGER NOT NULL,
                    "locataireId" INTEGER NOT NULL,
                    numero TEXT UNIQUE NOT NULL,
                    "periodeDebut" TIMESTAMP NOT NULL,
                    "periodeFin" TIMESTAMP NOT NULL,
                    "montantLoyer" DECIMAL(12, 2) NOT NULL,
                    "montantCharges" DECIMAL(12, 2) DEFAULT 0,
                    "montantTotal" DECIMAL(12, 2) NOT NULL,
                    "dateEmission" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "dateEcheance" TIMESTAMP NOT NULL,
                    statut TEXT DEFAULT 'impayee',
                    "fichierPdf" TEXT,
                    "motifAnnulation" TEXT,
                    "avoirLieId" INTEGER,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("contratId") REFERENCES contrats(id) ON DELETE CASCADE,
                    FOREIGN KEY ("locataireId") REFERENCES locataires(id) ON DELETE CASCADE
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS paiements (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    "factureId" INTEGER NOT NULL,
                    montant DECIMAL(12, 2) NOT NULL,
                    "datePaiement" TIMESTAMP NOT NULL,
                    mode TEXT NOT NULL,
                    reference TEXT,
                    "justificatifFichier" TEXT,
                    "enregistrePar" INTEGER,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("factureId") REFERENCES factures(id) ON DELETE CASCADE,
                    FOREIGN KEY ("enregistrePar") REFERENCES users(id)
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS cautions (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    "contratId" INTEGER NOT NULL,
                    "montantAttendu" DECIMAL(12, 2) NOT NULL,
                    "montantRecu" DECIMAL(12, 2) DEFAULT 0,
                    "modeReglement" TEXT,
                    "dateVersement" TIMESTAMP,
                    statut TEXT DEFAULT 'attendue',
                    "conditionsRemboursement" TEXT,
                    "conditionsRetenue" TEXT,
                    "justificatifFichier" TEXT,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("contratId") REFERENCES contrats(id) ON DELETE CASCADE
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS alertes (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    lu INTEGER DEFAULT 0,
                    "userId" INTEGER,
                    FOREIGN KEY ("userId") REFERENCES users(id)
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS journal_activite (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    "userId" INTEGER,
                    action TEXT NOT NULL,
                    entite TEXT,
                    "entiteId" INTEGER,
                    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "adresseIp" TEXT,
                    details TEXT,
                    FOREIGN KEY ("userId") REFERENCES users(id)
                )
            `);

            // 6. Création des données structurelles par défaut (idempotent)
            await initDefaultData();

            isInitialized = true;
            console.log('PostgreSQL database initialized successfully');

        } catch (error) {
            console.error('PostgreSQL initialization error:', error);
            throw error;
        } finally {
            initializationPromise = null;
        }
    })();

    return initializationPromise;
}

/**
 * Initialisation des données par défaut (idempotent)
 */
async function initDefaultData() {
    const pool = getPool();
    const db = await getDb();

    // Créer le site par défaut s'il n'existe pas
    const existingSite = await db.get(
        'SELECT id FROM sites WHERE nom = ?',
        'Site Principal'
    );

    let siteId;
    if (!existingSite) {
        const result = await db.run(`
            INSERT INTO sites (nom, adresse, ville, pays, actif)
            VALUES (?, ?, ?, ?, ?)
        `, ['Site Principal', 'Adresse par défaut', 'Casablanca', 'Maroc', 1]);
        siteId = result.lastID;
        console.log('✅ Site principal créé');
    } else {
        siteId = existingSite.id;
    }

    // Créer les étages par défaut
    const etages = ['RC', '1', '2', '3'];
    for (const etage of etages) {
        const existingEtage = await db.get(
            'SELECT id FROM etages WHERE "siteId" = ? AND nom = ?',
            [siteId, etage]
        );

        if (!existingEtage) {
            await db.run(`
                INSERT INTO etages ("siteId", nom, niveau, actif)
                VALUES (?, ?, ?, ?)
            `, [siteId, etage, parseInt(etage) || 0, 1]);
            console.log(`✅ Étage ${etage} créé`);
        }
    }
}

module.exports = {
    getDb,
    initTables,
    getPool
};