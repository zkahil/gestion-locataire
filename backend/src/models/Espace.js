// backend/src/models/Espace.js

const { getDb } = require('../config/database');

class Espace {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM espaces WHERE 1=1';
        const params = [];
        
        if (filters.etage) { query += ' AND etage = ?'; params.push(filters.etage); }
        if (filters.statut) { query += ' AND statut = ?'; params.push(filters.statut); }
        if (filters.type) { query += ' AND type = ?'; params.push(filters.type); }
        if (filters.siteId) { query += ' AND "siteId" = ?'; params.push(filters.siteId); }
        
        query += ' ORDER BY numero ASC';
        return db.all(query, params);
    }

    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM espaces WHERE id = ?', id);
    }

    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            `INSERT INTO espaces (
                numero, designation, type, superficie, etage, "siteId",
                "positionX", "positionY", largeur, hauteur, couleur,
                "loyerReference", "chargesReference", statut
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.numero, data.designation, data.type || 'bureau',
                data.superficie, data.etage || 'RC', data.siteId || null,
                data.positionX || 30, data.positionY || 30,
                data.largeur || 120, data.hauteur || 80,
                data.couleur || '#94a3b8',
                data.loyerReference || 0, data.chargesReference || 0,
                data.statut || 'disponible'
            ]
        );
        return result.lastID;
    }

    static async update(id, data) {
        const db = await getDb();
        const fields = [];
        const values = [];
        
        const allowed = [
            'numero', 'designation', 'type', 'superficie', 'etage',
            '"siteId"', '"positionX"', '"positionY"', 'largeur', 'hauteur',
            'couleur', '"loyerReference"', '"chargesReference"', 'statut',
            '"contratActifId"'
        ];
        
        for (const f of allowed) {
            if (data[f] !== undefined) {
                fields.push(`${f} = ?`);
                values.push(data[f]);
            }
        }
        
        if (fields.length === 0) return null;
        fields.push('"updatedAt" = CURRENT_TIMESTAMP');
        values.push(id);
        
        await db.run(`UPDATE espaces SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    }

    /**
     * Supprime un espace avec gestion complète des dépendances
     */
    static async delete(id) {
        const db = await getDb();
        
        try {
            return await db.transaction(async (client) => {
                // 1. Récupérer l'espace
                const espaceResult = await client.query(
                    'SELECT * FROM espaces WHERE id = $1',
                    [id]
                );
                
                if (espaceResult.rows.length === 0) {
                    throw new Error('Espace non trouvé');
                }
                
                const espace = espaceResult.rows[0];
                let contratResilie = false;
                let contratId = null;
                
                // 2. Si l'espace a un contrat actif
                if (espace.contratActifId) {
                    contratId = espace.contratActifId;
                    console.log(`📝 Espace ${id} a un contrat actif (${contratId})`);
                    
                    // Vérifier si le contrat existe toujours
                    const contratResult = await client.query(
                        'SELECT id, statut FROM contrats WHERE id = $1',
                        [contratId]
                    );
                    
                    if (contratResult.rows.length > 0) {
                        // Résilier le contrat
                        await client.query(
                            `UPDATE contrats 
                             SET statut = 'resilie',
                                 "dateFin" = CURRENT_TIMESTAMP,
                                 "updatedAt" = CURRENT_TIMESTAMP 
                             WHERE id = $1`,
                            [contratId]
                        );
                        contratResilie = true;
                        console.log(`✅ Contrat ${contratId} résilié`);
                    }
                    
                    // Mettre à jour l'espace (enlever la référence)
                    await client.query(
                        `UPDATE espaces 
                         SET "contratActifId" = NULL,
                             statut = 'disponible',
                             "updatedAt" = CURRENT_TIMESTAMP
                         WHERE id = $1`,
                        [id]
                    );
                }
                
                // 3. Supprimer l'espace
                await client.query(
                    'DELETE FROM espaces WHERE id = $1',
                    [id]
                );
                
                return {
                    success: true,
                    contratResilie: contratResilie,
                    contratId: contratId,
                    message: contratResilie 
                        ? `Espace supprimé avec résiliation automatique du contrat #${contratId}` 
                        : 'Espace supprimé avec succès'
                };
            });
        } catch (error) {
            console.error('❌ Erreur suppression espace:', error);
            // Si l'erreur est liée à une clé étrangère
            if (error.message.includes('foreign key') || error.message.includes('violates foreign key')) {
                // Essayer une suppression forcée
                const db = await getDb();
                await db.run('UPDATE espaces SET "contratActifId" = NULL WHERE id = ?', id);
                await db.run('DELETE FROM espaces WHERE id = ?', id);
                return {
                    success: true,
                    message: 'Espace supprimé après nettoyage des dépendances'
                };
            }
            throw error;
        }
    }

    static async getStats() {
        const db = await getDb();
        const stats = await db.all(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'disponible' THEN 1 ELSE 0 END) as disponibles,
                SUM(CASE WHEN statut = 'occupe' THEN 1 ELSE 0 END) as occupes,
                SUM(CASE WHEN statut = 'travaux' THEN 1 ELSE 0 END) as travaux,
                SUM(CASE WHEN statut = 'commun' THEN 1 ELSE 0 END) as communs
            FROM espaces
        `);
        return stats[0] || { total: 0, disponibles: 0, occupes: 0, travaux: 0, communs: 0 };
    }

    static async findBySiteId(siteId) {
        const db = await getDb();
        return db.all(
            'SELECT * FROM espaces WHERE "siteId" = ? ORDER BY numero',
            siteId
        );
    }

    static async findByContratActif(contratId) {
        const db = await getDb();
        return db.get(
            'SELECT * FROM espaces WHERE "contratActifId" = ?',
            contratId
        );
    }

    /**
     * Suppression forcée (utiliser en dernier recours)
     */
    static async forceDelete(id) {
        const db = await getDb();
        await db.run('UPDATE espaces SET "contratActifId" = NULL WHERE id = ?', id);
        await db.run('DELETE FROM espaces WHERE id = ?', id);
        return true;
    }
}

module.exports = Espace;