
const { getDb } = require('../config/database');

class Contrat {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM contrats WHERE 1=1';
        const params = [];
        if (filters.statut) { query += ' AND statut = ?'; params.push(filters.statut); }
        if (filters.espaceId) { query += ' AND espaceId = ?'; params.push(filters.espaceId); }
        if (filters.locataireId) { query += ' AND locataireId = ?'; params.push(filters.locataireId); }
        query += ' ORDER BY createdAt DESC';
        return db.all(query, params);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM contrats WHERE id = ?', id);
    }
    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO contrats (espaceId, locataireId, statut, dateSignature, dateDebut, dateFin, dureeMois, renouvellementAuto, delaiPreavisJours, conditionsResiliation, montantLoyer, periodicite, montantCharges, montantCaution, moisCaution, avanceVersee, modalitesPaiement, datePaiementPrevue, penalitesRetard, obligationsParticulieres, assuranceObligatoire, clauseResponsabiliteMarchandises, importePar, extraits, anomalies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [data.espaceId, data.locataireId, data.statut || 'brouillon_import', data.dateSignature, data.dateDebut, data.dateFin, data.dureeMois, data.renouvellementAuto || 0, data.delaiPreavisJours || 90, data.conditionsResiliation, data.montantLoyer, data.periodicite || 'mensuel', data.montantCharges || 0, data.montantCaution, data.moisCaution || 3, data.avanceVersee, data.modalitesPaiement, data.datePaiementPrevue, data.penalitesRetard, data.obligationsParticulieres, data.assuranceObligatoire || 0, data.clauseResponsabiliteMarchandises || 0, data.importePar, data.extraits ? JSON.stringify(data.extraits) : null, data.anomalies ? JSON.stringify(data.anomalies) : null]
        );
        return result.lastID;
    }
    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        const allowed = ['statut','dateSignature','dateDebut','dateFin','dureeMois','renouvellementAuto','delaiPreavisJours','conditionsResiliation','montantLoyer','periodicite','montantCharges','montantCaution','moisCaution','avanceVersee','modalitesPaiement','datePaiementPrevue','penalitesRetard','obligationsParticulieres','assuranceObligatoire','clauseResponsabiliteMarchandises','validePar','dateValidation'];
        for (const f of allowed) {
            if (data[f] !== undefined) { fields.push(f + ' = ?'); values.push(data[f]); }
        }
        if (data.extraits !== undefined) { fields.push('extraits = ?'); values.push(JSON.stringify(data.extraits)); }
        if (data.anomalies !== undefined) { fields.push('anomalies = ?'); values.push(JSON.stringify(data.anomalies)); }
        if (fields.length === 0) return null;
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        await db.run('UPDATE contrats SET ' + fields.join(', ') + ' WHERE id = ?', values);
        return true;
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM contrats WHERE id = ?', id);
        return true;
    }
}

module.exports = Contrat;
