const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  createSchedule,
  getSchedules,
} = require('../controllers/scheduleController');
const router = express.Router();

router.post('/', verifyToken, authorizeRoles('admin', 'staff', 'doctor'), createSchedule);
router.get('/', verifyToken, getSchedules);

module.exports = router;
