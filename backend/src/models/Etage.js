// backend/src/models/Etage.js
const { getDb } = require('../config/database');

class Etage {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM etages WHERE 1=1';
        const params = [];
        
        if (filters.siteId) {
            query += ' AND siteId = ?';
            params.push(filters.siteId);
        }
        if (filters.actif !== undefined) {
            query += ' AND actif = ?';
            params.push(filters.actif);
        }
        
        query += ' ORDER BY niveau ASC';
        return db.all(query, params);
    }

    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM etages WHERE id = ?', id);
    }

    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            `INSERT INTO etages (siteId, nom, niveau, description) VALUES (?, ?, ?, ?)`,
            [data.siteId, data.nom, data.niveau, data.description]
        );
        return result.lastID;
    }

    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        const allowed = ['nom','niveau','description','actif'];
        for (const f of allowed) {
            if (data[f] !== undefined) {
                fields.push(`${f} = ?`);
                values.push(data[f]);
            }
        }
        if (fields.length === 0) return null;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        await db.run(`UPDATE etages SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    }

    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM etages WHERE id = ?', id);
        return true;
    }
}

module.exports = Etage;