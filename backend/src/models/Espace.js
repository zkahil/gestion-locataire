// backend/src/models/Espace.js - Ajout de siteId
const { getDb } = require('../config/database');

class Espace {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM espaces WHERE 1=1';
        const params = [];
        
        if (filters.etage) { query += ' AND etage = ?'; params.push(filters.etage); }
        if (filters.statut) { query += ' AND statut = ?'; params.push(filters.statut); }
        if (filters.type) { query += ' AND type = ?'; params.push(filters.type); }
        if (filters.siteId) { query += ' AND siteId = ?'; params.push(filters.siteId); }
        
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
                numero, designation, type, superficie, etage, siteId,
                positionX, positionY, largeur, hauteur, couleur,
                loyerReference, chargesReference, statut
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
        const fields = [], values = [];
        const allowed = [
            'numero','designation','type','superficie','etage','siteId',
            'positionX','positionY','largeur','hauteur','couleur',
            'loyerReference','chargesReference','statut','contratActifId'
        ];
        for (const f of allowed) {
            if (data[f] !== undefined) {
                fields.push(`${f} = ?`);
                values.push(data[f]);
            }
        }
        if (fields.length === 0) return null;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        await db.run(`UPDATE espaces SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    }

    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM espaces WHERE id = ?', id);
        return true;
    }

    static async getStats() {
        const db = await getDb();
        const total = await db.get('SELECT COUNT(*) as count FROM espaces');
        const disponibles = await db.get("SELECT COUNT(*) as count FROM espaces WHERE statut = 'disponible'");
        const occupes = await db.get("SELECT COUNT(*) as count FROM espaces WHERE statut = 'occupe'");
        return { total: total.count, disponibles: disponibles.count, occupes: occupes.count };
    }
}

module.exports = Espace;