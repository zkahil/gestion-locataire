
const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const db = await getDb();
        return db.get('SELECT * FROM users WHERE email = ?', email);
    }
    static async findById(id) {
        const db = await getDb();
        return db.get('SELECT id, nom, email, role, actif, dateCreation, derniereConnexion FROM users WHERE id = ?', id);
    }
    static async findAll() {
        const db = await getDb();
        return db.all('SELECT id, nom, email, role, actif, dateCreation, derniereConnexion FROM users ORDER BY id');
    }
    static async create(data) {
        const db = await getDb();
        const hash = await bcrypt.hash(data.password, 10);
        const result = await db.run(
            'INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)',
            [data.nom, data.email, hash, data.role || 'consultation']
        );
        return result.lastID;
    }
    static async update(id, data) {
        const db = await getDb();
        const fields = [], values = [];
        if (data.nom) { fields.push('nom = ?'); values.push(data.nom); }
        if (data.email) { fields.push('email = ?'); values.push(data.email); }
        if (data.role) { fields.push('role = ?'); values.push(data.role); }
        if (data.actif !== undefined) { fields.push('actif = ?'); values.push(data.actif); }
        if (fields.length === 0) return null;
        values.push(id);
        await db.run('UPDATE users SET ' + fields.join(', ') + ' WHERE id = ?', values);
        return true;
    }
    static async updateLastLogin(id) {
        const db = await getDb();
        await db.run('UPDATE users SET derniereConnexion = CURRENT_TIMESTAMP WHERE id = ?', id);
    }
    static async delete(id) {
        const db = await getDb();
        await db.run('DELETE FROM users WHERE id = ?', id);
        return true;
    }
    static async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

module.exports = User;
