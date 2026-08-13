
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
    try {
        const { nom, email, password, role } = req.body;
        const existing = await User.findByEmail(email);
        if (existing) return res.status(400).json({ message: 'Email deja utilise' });
        const id = await User.create({ nom, email, password, role });
        res.status(201).json({ success: true, token: generateToken(id), user: { id, nom, email, role: role || 'consultation' } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        if (!user.actif) return res.status(403).json({ message: 'Compte desactive' });
        await User.updateLastLogin(user.id);
        res.json({ success: true, token: generateToken(user.id), user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouve' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        await User.update(req.user.id, req.body);
        const user = await User.findById(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
