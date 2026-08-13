
const Facture = require('../models/Facture');
const Contrat = require('../models/Contrat');

exports.getAll = async (req, res) => {
    try {
        const { contratId, statut } = req.query;
        const data = await Facture.findAll({ contratId, statut });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const data = await Facture.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Facture non trouvee' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const contrat = await Contrat.findById(req.body.contratId);
        if (!contrat) return res.status(404).json({ message: 'Contrat non trouve' });
        const last = await Facture.findAll({ contratId: req.body.contratId });
        const num = 'F' + new Date().getFullYear() + '-' + String(last.length + 1).padStart(4, '0');
        const data = { ...req.body, numero: num };
        const id = await Facture.create(data);
        const facture = await Facture.findById(id);
        res.status(201).json({ success: true, data: facture });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id);
        if (!facture) return res.status(404).json({ message: 'Facture non trouvee' });
        await Facture.update(req.params.id, req.body);
        const updated = await Facture.findById(req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id);
        if (!facture) return res.status(404).json({ message: 'Facture non trouvee' });
        await Facture.delete(req.params.id);
        res.json({ success: true, message: 'Facture supprimee' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
