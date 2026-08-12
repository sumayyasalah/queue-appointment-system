const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { getUsers, getDoctors, getProfile, createUser } = require('../controllers/userController');
const router = express.Router();

router.get('/', verifyToken, authorizeRoles('admin'), getUsers);
router.post('/', verifyToken, authorizeRoles('admin'), createUser);
router.get('/doctors', verifyToken, getDoctors);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
