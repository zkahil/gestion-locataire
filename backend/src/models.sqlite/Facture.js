
const { getDb } = require('../config/database');

class Facture {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM factures WHERE 1=1';
        const params = [];
        if (filters.contratId) { query += ' AND contratId = ?'; params.push(filters.contratId); }
        if (filters.statut) { query += ' AND statut = ?'; params.push(filters.statut); }
        query += ' ORDER BY createdAt DESC';
        return db.all(query, params);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM factures WHERE id = ?', id);
    }
    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO factures (contratId, locataireId, numero, periodeDebut, periodeFin, montantLoyer, montantCharges, montantTotal, dateEcheance, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.contratId, data.locataireId, data.numero, data.periodeDebut, data.periodeFin, data.montantLoyer, data.montantCharges || 0, data.montantTotal, data.dateEcheance, data.statut || 'impayee']
        );
        return result.lastID;
    }
    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        const allowed = ['statut','fichierPdf','motifAnnulation','avoirLieId'];
        for (const f of allowed) {
            if (data[f] !== undefined) { fields.push(f + ' = ?'); values.push(data[f]); }
        }
        if (fields.length === 0) return null;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        await db.run('UPDATE factures SET ' + fields.join(', ') + ' WHERE id = ?', values);
        return true;
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM factures WHERE id = ?', id);
        return true;
    }
}

module.exports = Facture;
