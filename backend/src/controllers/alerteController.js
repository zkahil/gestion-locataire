
const Alerte = require('../models/Alerte');

exports.getAll = async (req, res) => {
    try {
        const { lu } = req.query;
        const data = await Alerte.findAll({ lu, userId: req.user.id });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const data = await Alerte.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Alerte non trouvee' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await Alerte.create({ ...req.body, userId: req.user.id });
        const data = await Alerte.findById(id);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const alerte = await Alerte.findById(req.params.id);
        if (!alerte) return res.status(404).json({ message: 'Alerte non trouvee' });
        await Alerte.update(req.params.id, { lu: 1 });
        const updated = await Alerte.findById(req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const alertes = await Alerte.findAll({ lu: 0, userId: req.user.id });
        for (const a of alertes) {
            await Alerte.update(a.id, { lu: 1 });
        }
        res.json({ success: true, message: 'Toutes les alertes marquees comme lues' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const data = await Alerte.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Alerte non trouvee' });
        await Alerte.delete(req.params.id);
        res.json({ success: true, message: 'Alerte supprimee' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
