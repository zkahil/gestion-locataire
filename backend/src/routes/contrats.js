
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAll, getOne, create, update, delete: del, getAnomalies } = require('../controllers/contratController');

router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.get('/:id/anomalies', protect, getAnomalies);
router.post('/', protect, authorize('admin', 'gestionnaire'), create);
router.put('/:id', protect, authorize('admin', 'gestionnaire'), update);
router.delete('/:id', protect, authorize('admin'), del);

module.exports = router;
