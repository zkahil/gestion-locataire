// backend/src/models/Site.js
const { getDb } = require('../config/database');

class Site {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM sites WHERE 1=1';
        const params = [];
        
        if (filters.actif !== undefined) {
            query += ' AND actif = ?';
            params.push(filters.actif);
        }
        if (filters.ville) {
            query += ' AND ville LIKE ?';
            params.push(`%${filters.ville}%`);
        }
        
        query += ' ORDER BY nom ASC';
        return db.all(query, params);
    }

    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM sites WHERE id = ?', id);
    }

    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            `INSERT INTO sites (nom, adresse, ville, codePostal, pays, latitude, longitude, description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.nom, data.adresse, data.ville, data.codePostal, data.pays || 'Maroc', 
             data.latitude, data.longitude, data.description]
        );
        return result.lastID;
    }

    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        const allowed = ['nom','adresse','ville','codePostal','pays','latitude','longitude','description','actif'];
        for (const f of allowed) {
            if (data[f] !== undefined) {
                fields.push(`${f} = ?`);
                values.push(data[f]);
            }
        }
        if (fields.length === 0) return null;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        await db.run(`UPDATE sites SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    }

    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM sites WHERE id = ?', id);
        return true;
    }

    static async getEspaces(id) {
        const db = await getDb();
        return db.all('SELECT * FROM espaces WHERE siteId = ? ORDER BY numero', id);
    }

    static async getEtages(id) {
        const db = await getDb();
        return db.all('SELECT * FROM etages WHERE siteId = ? ORDER BY niveau', id);
    }
}

module.exports = Site;