
const Caution = require('../models/Caution');
const Contrat = require('../models/Contrat');

exports.getAll = async (req, res) => {
    try {
        const { contratId, statut } = req.query;
        const data = await Caution.findAll({ contratId, statut });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const data = await Caution.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Caution non trouvee' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const contrat = await Contrat.findById(req.body.contratId);
        if (!contrat) return res.status(404).json({ message: 'Contrat non trouve' });
        const id = await Caution.create(req.body);
        const data = await Caution.findById(id);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const caution = await Caution.findById(req.params.id);
        if (!caution) return res.status(404).json({ message: 'Caution non trouvee' });
        await Caution.update(req.params.id, req.body);
        const updated = await Caution.findById(req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const data = await Caution.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Caution non trouvee' });
        await Caution.delete(req.params.id);
        res.json({ success: true, message: 'Caution supprimee' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
