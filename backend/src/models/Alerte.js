
const { getDb } = require('../config/database');

class Alerte {
    static async findAll(filters = {}) {
        const db = await getDb();
        let query = 'SELECT * FROM alertes WHERE 1=1';
        const params = [];
        if (filters.lu !== undefined) { query += ' AND lu = ?'; params.push(filters.lu); }
        if (filters.userId) { query += ' AND userId = ?'; params.push(filters.userId); }
        query += ' ORDER BY date DESC';
        return db.all(query, params);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT * FROM alertes WHERE id = ?', id);
    }
    static async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO alertes (type, message, userId) VALUES (?, ?, ?)',
            [data.type, data.message, data.userId]
        );
        return result.lastID;
    }
    static async update(id, data) {
        const db = await getDb();
        if (data.lu !== undefined) {
            await db.run('UPDATE alertes SET lu = ? WHERE id = ?', [data.lu, id]);
            return true;
        }
        return null;
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM alertes WHERE id = ?', id);
        return true;
    }
}

module.exports = Alerte;
