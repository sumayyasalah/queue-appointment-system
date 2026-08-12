const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  getCurrentQueue,
  getQueueList,
  updateQueue,
} = require('../controllers/queueController');
const router = express.Router();

router.get('/current', verifyToken, getCurrentQueue);
router.get('/list', verifyToken, authorizeRoles('admin', 'staff', 'doctor'), getQueueList);
router.put('/update', verifyToken, authorizeRoles('admin', 'staff', 'doctor'), updateQueue);

module.exports = router;
