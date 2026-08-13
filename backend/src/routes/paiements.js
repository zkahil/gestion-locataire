
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAll, getOne, create, delete: del } = require('../controllers/paiementController');

router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.post('/', protect, authorize('admin', 'comptable'), create);
router.delete('/:id', protect, authorize('admin'), del);

module.exports = router;
