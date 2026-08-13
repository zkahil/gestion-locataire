
const Contrat = require('../models/Contrat');
const Espace = require('../models/Espace');

exports.getAll = async (req, res) => {
    try {
        const { statut, espaceId, locataireId } = req.query;
        const data = await Contrat.findAll({ statut, espaceId, locataireId });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const data = await Contrat.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Contrat non trouve' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const espace = await Espace.findById(req.body.espaceId);
        if (!espace) return res.status(404).json({ message: 'Espace non trouve' });
        if (espace.statut === 'occupe') return res.status(400).json({ message: 'Espace occupe' });
        const id = await Contrat.create(req.body);
        const data = await Contrat.findById(id);
        if (data.statut === 'actif') {
            await Espace.update(espace.id, { statut: 'occupe', contratActifId: id });
        }
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const contrat = await Contrat.findById(req.params.id);
        if (!contrat) return res.status(404).json({ message: 'Contrat non trouve' });
        await Contrat.update(req.params.id, req.body);
        const updated = await Contrat.findById(req.params.id);
        if (updated.statut === 'actif') {
            const espace = await Espace.findById(updated.espaceId);
            if (espace) await Espace.update(espace.id, { statut: 'occupe', contratActifId: updated.id });
        } else if (updated.statut === 'resilie' || updated.statut === 'expire') {
            const espace = await Espace.findById(updated.espaceId);
            if (espace) await Espace.update(espace.id, { statut: 'disponible', contratActifId: null });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const contrat = await Contrat.findById(req.params.id);
        if (!contrat) return res.status(404).json({ message: 'Contrat non trouve' });
        if (contrat.statut === 'actif') {
            const espace = await Espace.findById(contrat.espaceId);
            if (espace) await Espace.update(espace.id, { statut: 'disponible', contratActifId: null });
        }
        await Contrat.delete(req.params.id);
        res.json({ success: true, message: 'Contrat supprime' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAnomalies = async (req, res) => {
    try {
        const contrat = await Contrat.findById(req.params.id);
        if (!contrat) return res.status(404).json({ message: 'Contrat non trouve' });
        const anomalies = contrat.anomalies ? JSON.parse(contrat.anomalies) : [];
        res.json({ success: true, data: anomalies });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
