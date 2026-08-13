
const { getDb } = require('../config/database');

class Caution {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM cautions WHERE 1=1';
        const params = [];
        if (filters.contratId) { query += ' AND contratId = ?'; params.push(filters.contratId); }
        if (filters.statut) { query += ' AND statut = ?'; params.push(filters.statut); }
        query += ' ORDER BY createdAt DESC';
        return db.all(query, params);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM cautions WHERE id = ?', id);
    }
    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO cautions (contratId, montantAttendu, montantRecu, modeReglement, dateVersement, statut, conditionsRemboursement, conditionsRetenue, justificatifFichier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.contratId, data.montantAttendu, data.montantRecu || 0, data.modeReglement, data.dateVersement, data.statut || 'attendue', data.conditionsRemboursement, data.conditionsRetenue, data.justificatifFichier]
        );
        return result.lastID;
    }
    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        const allowed = ['montantRecu','statut','conditionsRemboursement','conditionsRetenue','justificatifFichier'];
        for (const f of allowed) {
            if (data[f] !== undefined) { fields.push(f + ' = ?'); values.push(data[f]); }
        }
        if (fields.length === 0) return null;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        await db.run('UPDATE cautions SET ' + fields.join(', ') + ' WHERE id = ?', values);
        return true;
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM cautions WHERE id = ?', id);
        return true;
    }
}

module.exports = Caution;
