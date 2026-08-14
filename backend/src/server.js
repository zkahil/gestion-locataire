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

// ✅ Configuration CORS complète pour le développement et la production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://gestion-locataire-jack.vercel.app',
    'https://gestion-locataire-frontend.vercel.app',
    process.env.FRONTEND_URL // Pour la variable d'environnement
].filter(Boolean); // Enlever les valeurs undefined

// Configuration CORS améliorée
app.use(cors({
    origin: function (origin, callback) {
        // Permettre les requêtes sans origin (Postman, apps mobiles)
        if (!origin) return callback(null, true);
        
        // En développement, accepter toutes les origines
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // Vérifier si l'origine est autorisée
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('⚠️ CORS bloqué pour:', origin);
            console.log('📌 Origines autorisées:', allowedOrigins);
            callback(new Error('Origine non autorisée par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 heures
}));

// Helmet avec configuration moins restrictive
app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Initialisation de la base de données (gérer l'erreur sans bloquer)
initTables().catch(err => {
    console.error('❌ Database initialization error:', err);
    console.log('⚠️ Le serveur démarre sans base de données. Vérifiez DATABASE_URL');
});

// Middleware de logging (optionnel, pour le debug)
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path}`);
    next();
});

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

// Route health (sans /api pour compatibilité)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        cors_enabled: true
    });
});

// Route racine avec info
app.get('/', (req, res) => {
    res.json({
        message: 'API Gestion Locataire',
        version: '1.0.0',
        endpoints: [
            '/api/auth/login',
            '/api/auth/register',
            '/api/locataires',
            '/api/contrats',
            '/api/espaces',
            '/api/sites',
            '/api/etages',
            '/api/factures',
            '/api/paiements',
            '/api/cautions',
            '/api/alertes',
            '/health'
        ]
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route non trouvée',
        path: req.path,
        method: req.method
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    // Erreur CORS
    if (err.message === 'Origine non autorisée par CORS') {
        return res.status(403).json({
            message: err.message,
            origin: req.headers.origin
        });
    }
    
    res.status(500).json({ 
        message: 'Erreur serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrer le serveur
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('🚀 Server running on port', PORT);
        console.log('📌 Environment:', process.env.NODE_ENV || 'development');
        console.log('📌 CORS origins allowed:', allowedOrigins);
        console.log('📌 Health check: http://localhost:' + PORT + '/health');
    });
}

module.exports = app;