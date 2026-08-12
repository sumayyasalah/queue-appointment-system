const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const router = express.Router();

router.post('/', verifyToken, authorizeRoles('patient'), createAppointment);
router.get('/', verifyToken, getAppointments);
router.put('/:id', verifyToken, authorizeRoles('admin', 'staff', 'doctor'), updateAppointment);
router.delete('/:id', verifyToken, authorizeRoles('admin', 'staff', 'patient'), deleteAppointment);

module.exports = router;
