// backend/src/routes/etages.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAll,
    getOne,
    create,
    update,
    delete: deleteEtage,
    getEspaces
} = require('../controllers/etageController');

router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.get('/:id/espaces', protect, getEspaces);
router.post('/', protect, authorize('admin', 'gestionnaire'), create);
router.put('/:id', protect, authorize('admin', 'gestionnaire'), update);
router.delete('/:id', protect, authorize('admin'), deleteEtage);

module.exports = router;