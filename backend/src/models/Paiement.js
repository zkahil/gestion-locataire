
const { getDb } = require('../config/database');

class Paiement {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM paiements WHERE 1=1';
        const params = [];
        if (filters.factureId) { query += ' AND factureId = ?'; params.push(filters.factureId); }
        query += ' ORDER BY datePaiement DESC';
        return db.all(query, params);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM paiements WHERE id = ?', id);
    }
    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO paiements (factureId, montant, datePaiement, mode, reference, justificatifFichier, enregistrePar) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.factureId, data.montant, data.datePaiement, data.mode, data.reference, data.justificatifFichier, data.enregistrePar]
        );
        return result.lastID;
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM paiements WHERE id = ?', id);
        return true;
    }
}

module.exports = Paiement;
