const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  getCurrentQueue,
  getQueueList,
  updateQueue,
} = require('../controllers/queueController');
const router = express.Router();

router.get('/current', verifyToken, getCurrentQueue);
router.get('/list', verifyToken, getQueueList);
router.put('/update', verifyToken, updateQueue);

module.exports = router;
