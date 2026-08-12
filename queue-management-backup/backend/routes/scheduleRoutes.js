const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  createSchedule,
  getSchedules,
} = require('../controllers/scheduleController');
const router = express.Router();

router.post('/', verifyToken, createSchedule);
router.get('/', verifyToken, getSchedules);

module.exports = router;
