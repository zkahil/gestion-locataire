
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAll, getOne, create, update, delete: del } = require('../controllers/factureController');

router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.post('/', protect, authorize('admin', 'gestionnaire', 'comptable'), create);
router.put('/:id', protect, authorize('admin', 'gestionnaire', 'comptable'), update);
router.delete('/:id', protect, authorize('admin'), del);

module.exports = router;
