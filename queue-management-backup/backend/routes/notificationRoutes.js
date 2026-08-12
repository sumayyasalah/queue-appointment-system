const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { sendNotification } = require('../controllers/notificationController');
const router = express.Router();

router.post('/send', verifyToken, sendNotification);

module.exports = router;
