// backend/src/controllers/etageController.js
const Etage = require('../models/Etage');
const Site = require('../models/Site');
const Espace = require('../models/Espace');

exports.getAll = async (req, res) => {
    try {
        const { siteId, actif } = req.query;
        const etages = await Etage.findAll({ siteId, actif });
        res.json({ success: true, data: etages });
    } catch (error) {
        console.error('Get all etages error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const etage = await Etage.findById(req.params.id);
        if (!etage) {
            return res.status(404).json({ message: 'Étage non trouvé' });
        }
        res.json({ success: true, data: etage });
    } catch (error) {
        console.error('Get etage error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        // Vérifier que le site existe
        const site = await Site.findById(req.body.siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        const id = await Etage.create(req.body);
        const etage = await Etage.findById(id);
        res.status(201).json({ success: true, data: etage });
    } catch (error) {
        console.error('Create etage error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const etage = await Etage.findById(req.params.id);
        if (!etage) {
            return res.status(404).json({ message: 'Étage non trouvé' });
        }
        await Etage.update(req.params.id, req.body);
        const updated = await Etage.findById(req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update etage error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const etage = await Etage.findById(req.params.id);
        if (!etage) {
            return res.status(404).json({ message: 'Étage non trouvé' });
        }
        // Vérifier si des espaces sont associés
        const espaces = await Espace.findAll({ etage: etage.nom });
        if (espaces && espaces.length > 0) {
            return res.status(400).json({ 
                message: 'Cet étage contient des espaces. Supprimez-les d\'abord.' 
            });
        }
        await Etage.delete(req.params.id);
        res.json({ success: true, message: 'Étage supprimé' });
    } catch (error) {
        console.error('Delete etage error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEspaces = async (req, res) => {
    try {
        const etage = await Etage.findById(req.params.id);
        if (!etage) {
            return res.status(404).json({ message: 'Étage non trouvé' });
        }
        const espaces = await Espace.findAll({ etage: etage.nom });
        res.json({ success: true, data: espaces });
    } catch (error) {
        console.error('Get etage espaces error:', error);
        res.status(500).json({ message: error.message });
    }
};