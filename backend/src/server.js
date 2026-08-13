// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initTables } = require('./config/database');
const authRoutes = require('./routes/auth');
const espaceRoutes = require('./routes/espaces');
const locataireRoutes = require('./routes/locataires');
const contratRoutes = require('./routes/contrats');
const factureRoutes = require('./routes/factures');
const paiementRoutes = require('./routes/paiements');
const cautionRoutes = require('./routes/cautions');
const alerteRoutes = require('./routes/alertes');
const siteRoutes = require('./routes/sites');
const etageRoutes = require('./routes/etages');

const app = express();
initTables().catch(console.error);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/espaces', espaceRoutes);
app.use('/api/locataires', locataireRoutes);
app.use('/api/contrats', contratRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/cautions', cautionRoutes);
app.use('/api/alertes', alerteRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/etages', etageRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ message: 'Route non trouvee' }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server running on port ' + PORT));