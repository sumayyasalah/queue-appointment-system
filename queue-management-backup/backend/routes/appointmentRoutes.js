const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const router = express.Router();

router.post('/', verifyToken, createAppointment);
router.get('/', verifyToken, getAppointments);
router.put('/:id', verifyToken, updateAppointment);
router.delete('/:id', verifyToken, deleteAppointment);

module.exports = router;
