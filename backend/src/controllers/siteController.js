// backend/src/controllers/siteController.js
const Site = require('../models/Site');
const Espace = require('../models/Espace');
const Etage = require('../models/Etage');

exports.getAll = async (req, res) => {
    try {
        const { actif, ville } = req.query;
        const sites = await Site.findAll({ actif, ville });
        res.json({ success: true, data: sites });
    } catch (error) {
        console.error('Get all sites error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        res.json({ success: true, data: site });
    } catch (error) {
        console.error('Get site error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await Site.create(req.body);
        const site = await Site.findById(id);
        res.status(201).json({ success: true, data: site });
    } catch (error) {
        console.error('Create site error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        await Site.update(req.params.id, req.body);
        const updated = await Site.findById(req.params.id);
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Update site error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        // Vérifier si des espaces sont associés
        const espaces = await Site.getEspaces(req.params.id);
        if (espaces && espaces.length > 0) {
            return res.status(400).json({ 
                message: 'Ce site contient des espaces. Supprimez-les d\'abord.' 
            });
        }
        await Site.delete(req.params.id);
        res.json({ success: true, message: 'Site supprimé' });
    } catch (error) {
        console.error('Delete site error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEspaces = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        const espaces = await Site.getEspaces(req.params.id);
        res.json({ success: true, data: espaces });
    } catch (error) {
        console.error('Get site espaces error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEtages = async (req, res) => {
    try {
        const site = await Site.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        const etages = await Site.getEtages(req.params.id);
        res.json({ success: true, data: etages });
    } catch (error) {
        console.error('Get site etages error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const sites = await Site.findAll();
        const totalEspaces = await Espace.findAll();
        const stats = {
            totalSites: sites.length,
            totalEspaces: totalEspaces.length,
            sites: sites.map(s => ({
                id: s.id,
                nom: s.nom,
                nbEspaces: totalEspaces.filter(e => e.siteId === s.id).length
            }))
        };
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get site stats error:', error);
        res.status(500).json({ message: error.message });
    }
};