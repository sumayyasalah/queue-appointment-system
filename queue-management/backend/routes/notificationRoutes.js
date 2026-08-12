const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { sendNotification, getNotifications } = require('../controllers/notificationController');
const router = express.Router();

router.post('/send', verifyToken, authorizeRoles('admin', 'staff', 'doctor'), sendNotification);
router.get('/', verifyToken, getNotifications);

module.exports = router;
