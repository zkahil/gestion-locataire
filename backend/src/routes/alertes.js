
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAll, getOne, create, markAsRead, markAllAsRead, delete: del } = require('../controllers/alerteController');

router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.post('/', protect, create);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, del);

module.exports = router;
