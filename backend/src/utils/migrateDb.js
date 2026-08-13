// backend/src/utils/migrateDb.js
const { getDb } = require('../config/database');

async function migrate() {
    try {
        const db = await getDb();
        
        // Vérifier les colonnes existantes dans espaces
        const columnInfo = await db.all("PRAGMA table_info(espaces)");
        const columnNames = columnInfo.map(c => c.name);
        console.log('📋 Colonnes existantes dans espaces:', columnNames.join(', '));
        
        // Ajouter siteId si manquant
        if (!columnNames.includes('siteId')) {
            await db.exec(`ALTER TABLE espaces ADD COLUMN siteId INTEGER REFERENCES sites(id)`);
            console.log('✅ Colonne siteId ajoutée');
        } else {
            console.log('ℹ️ Colonne siteId existe déjà');
        }
        
        // Ajouter etage si manquant
        if (!columnNames.includes('etage')) {
            await db.exec(`ALTER TABLE espaces ADD COLUMN etage TEXT DEFAULT 'RC'`);
            console.log('✅ Colonne etage ajoutée');
        } else {
            console.log('ℹ️ Colonne etage existe déjà');
        }
        
        // Vérifier les sites
        const siteCount = await db.get('SELECT COUNT(*) as count FROM sites');
        if (siteCount.count === 0) {
            await db.run(`
                INSERT INTO sites (nom, adresse, ville, pays, latitude, longitude, description) 
                VALUES ('Siège Social', '1 Rue de la Paix', 'Casablanca', 'Maroc', 33.5731, -7.5898, 'Site principal')
            `);
            console.log('✅ Site par défaut créé');
        }
        
        // Récupérer le site
        const site = await db.get('SELECT id FROM sites LIMIT 1');
        
        // Mettre à jour les espaces existants avec le siteId
        if (site) {
            await db.run(`UPDATE espaces SET siteId = ? WHERE siteId IS NULL`, [site.id]);
            console.log('✅ Espaces mis à jour avec le siteId');
            
            // Vérifier les étages
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
        
        console.log('🎉 Migration terminée avec succès');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de migration:', error);
        process.exit(1);
    }
}

migrate();