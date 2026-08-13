// backend/src/routes/sites.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAll,
    getOne,
    create,
    update,
    delete: deleteSite,
    getEspaces,
    getEtages,
    getStats
} = require('../controllers/siteController');

router.get('/', protect, getAll);
router.get('/stats', protect, getStats);
router.get('/:id', protect, getOne);
router.get('/:id/espaces', protect, getEspaces);
router.get('/:id/etages', protect, getEtages);
router.post('/', protect, authorize('admin', 'gestionnaire'), create);
router.put('/:id', protect, authorize('admin', 'gestionnaire'), update);
router.delete('/:id', protect, authorize('admin'), deleteSite);

module.exports = router;