
const Paiement = require('../models/Paiement');
const Facture = require('../models/Facture');

exports.getAll = async (req, res) => {
    try {
        const { factureId } = req.query;
        const data = await Paiement.findAll({ factureId });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const data = await Paiement.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Paiement non trouve' });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const facture = await Facture.findById(req.body.factureId);
        if (!facture) return res.status(404).json({ message: 'Facture non trouvee' });
        const id = await Paiement.create(req.body);
        const data = await Paiement.findById(id);
        await Facture.update(facture.id, { statut: 'payee' });
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const data = await Paiement.findById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Paiement non trouve' });
        await Paiement.delete(req.params.id);
        res.json({ success: true, message: 'Paiement supprime' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
