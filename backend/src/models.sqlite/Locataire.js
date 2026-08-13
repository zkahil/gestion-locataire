
const { getDb } = require('../config/database');

class Locataire {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM locataires WHERE 1=1';
        const params = [];
        if (filters.type) { query += ' AND type = ?'; params.push(filters.type); }
        if (filters.nom) { query += ' AND nomComplet LIKE ?'; params.push('%' + filters.nom + '%'); }
        query += ' ORDER BY nomComplet ASC';
        return db.all(query, params);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM locataires WHERE id = ?', id);
    }
    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO locataires (type, nomComplet, cin, ice, registreCommerce, identifiantFiscal, adresse, telephone, email, representantLegal, creePar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.type, data.nomComplet, data.cin, data.ice, data.registreCommerce, data.identifiantFiscal, data.adresse, data.telephone, data.email, data.representantLegal, data.creePar]
        );
        return result.lastID;
    }
    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        const allowed = ['type','nomComplet','cin','ice','registreCommerce','identifiantFiscal','adresse','telephone','email','representantLegal'];
        for (const f of allowed) {
            if (data[f] !== undefined) { fields.push(f + ' = ?'); values.push(data[f]); }
        }
        if (fields.length === 0) return null;
        values.push(id);
        await db.run('UPDATE locataires SET ' + fields.join(', ') + ' WHERE id = ?', values);
        return true;
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM locataires WHERE id = ?', id);
        return true;
    }
}

module.exports = Locataire;
