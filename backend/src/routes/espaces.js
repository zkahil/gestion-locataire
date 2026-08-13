
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAll, getOne, create, update, delete: del, getStats } = require('../controllers/espaceController');

router.get('/', protect, getAll);
router.get('/stats', protect, getStats);
router.get('/:id', protect, getOne);
router.post('/', protect, authorize('admin', 'gestionnaire'), create);
router.put('/:id', protect, authorize('admin', 'gestionnaire'), update);
router.delete('/:id', protect, authorize('admin'), del);

module.exports = router;
