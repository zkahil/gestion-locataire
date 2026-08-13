// backend/src/utils/resetDb.js
const { getDb } = require('../config/database');

async function resetDb() {
    try {
        const db = await getDb();
        
        // Vérifier les tables existantes
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📊 Tables existantes:', tables.map(t => t.name).join(', '));
        
        // Ajouter les colonnes manquantes si nécessaire
        const columnInfo = await db.all("PRAGMA table_info(espaces)");
        const columns = columnInfo.map(c => c.name);
        console.log('📋 Colonnes dans espaces:', columns.join(', '));
        
        // Ajouter siteId si manquant
        if (!columns.includes('siteId')) {
            await db.exec(`ALTER TABLE espaces ADD COLUMN siteId INTEGER REFERENCES sites(id)`);
            console.log('✅ Colonne siteId ajoutée');
        }
        
        // Ajouter etage si manquant
        if (!columns.includes('etage')) {
            await db.exec(`ALTER TABLE espaces ADD COLUMN etage TEXT DEFAULT 'RC'`);
            console.log('✅ Colonne etage ajoutée');
        }
        
        // Vérifier les sites
        const sitesCount = await db.get('SELECT COUNT(*) as count FROM sites');
        if (sitesCount.count === 0) {
            await db.run(`
                INSERT INTO sites (nom, adresse, ville, pays, latitude, longitude, description) 
                VALUES ('Siège Social', '1 Rue de la Paix', 'Casablanca', 'Maroc', 33.5731, -7.5898, 'Site principal')
            `);
            console.log('✅ Site par défaut créé');
        }
        
        // Récupérer le site
        const site = await db.get('SELECT id FROM sites LIMIT 1');
        
        // Mettre à jour les espaces
        if (site) {
            await db.run(`UPDATE espaces SET siteId = ? WHERE siteId IS NULL`, [site.id]);
            console.log('✅ Espaces mis à jour');
            
            // Vérifier les étages
            const etagesCount = await db.get('SELECT COUNT(*) as count FROM etages WHERE siteId = ?', [site.id]);
            if (etagesCount.count === 0) {
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
        
        console.log('🎉 Réinitialisation terminée');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

resetDb();