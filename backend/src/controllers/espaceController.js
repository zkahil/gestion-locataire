
const Espace = require('../models/Espace');

exports.getAll = async (req, res) => {
    try {
        const { etage, statut, type } = req.query;
        const espaces = await Espace.findAll({ etage, statut, type });
        res.json({ success: true, data: espaces });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const espace = await Espace.findById(req.params.id);
        if (!espace) return res.status(404).json({ message: 'Espace non trouve' });
        res.json({ success: true, data: espace });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await Espace.create(req.body);
        const espace = await Espace.findById(id);
        res.status(201).json({ success: true, data: espace });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Ce numero d\'espace existe deja' });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        await Espace.update(req.params.id, req.body);
        const espace = await Espace.findById(req.params.id);
        if (!espace) return res.status(404).json({ message: 'Espace non trouve' });
        res.json({ success: true, data: espace });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const espace = await Espace.findById(req.params.id);
        if (!espace) {
            return res.status(404).json({ message: 'Espace non trouvé' });
        }

        // Supprimer l'espace (le modèle gère la transaction)
        const result = await Espace.delete(req.params.id);
        
        res.json({ 
            success: true, 
            message: result.message || 'Espace supprimé avec succès',
            contratResilie: result.contratResilie || false,
            contratId: result.contratId || null
        });
    } catch (error) {
        console.error('❌ Erreur delete espace:', error);
        if (error.message.includes('foreign key')) {
            return res.status(400).json({ 
                message: 'Cet espace est lié à des contrats ou factures. Veuillez d\'abord les supprimer.' 
            });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await Espace.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
