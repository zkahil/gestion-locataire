
const Locataire = require('../models/Locataire');

exports.getAll = async (req, res) => {
    try {
        const { type, nom } = req.query;
        const data = await Locataire.findAll({ type, nom });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const data = await Locataire.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Locataire non trouve' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await Locataire.create(req.body);
        const data = await Locataire.findById(id);
        res.status(201).json({ success: true, data });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'CIN ou ICE deja utilise' });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        await Locataire.update(req.params.id, req.body);
        const data = await Locataire.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Locataire non trouve' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const data = await Locataire.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Locataire non trouve' });
        await Locataire.delete(req.params.id);
        res.json({ success: true, message: 'Locataire supprime' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
