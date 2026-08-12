const Token = require('../models/Token');
const Appointment = require('../models/Appointment');

const scopedAppointmentFilter = (user, doctorId) => {
  if (user.role === 'doctor') return { doctorId: user.id };
  if (user.role === 'patient') return { doctorId };
  return doctorId ? { doctorId } : {};
};

exports.getCurrentQueue = async (req, res) => {
  try {
    const doctorId = req.user.role === 'doctor' ? req.user.id : req.query.doctorId;
    if (req.user.role === 'patient' && !doctorId) {
      return res.status(400).json({ message: 'doctorId is required for patient queue status' });
    }
    const appointmentIds = await Appointment.find(scopedAppointmentFilter(req.user, doctorId)).distinct('_id');
    const filter = { appointmentId: { $in: appointmentIds }, queueStatus: 'waiting' };
    const current = await Token.findOne(filter).sort({ tokenNumber: 1 });
    res.json({ currentServing: current ? current.tokenNumber : null, waitingCount: await Token.countDocuments(filter) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch current queue', error: error.message });
  }
};

exports.getQueueList = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'doctor') {
      const appointmentIds = await Appointment.find({ doctorId: req.user.id }).distinct('_id');
      filter.appointmentId = { $in: appointmentIds };
    }
    const queueList = await Token.find(filter).sort({ tokenNumber: 1 }).populate({ path: 'appointmentId', select: 'appointmentDate slot reason status patientId doctorId', populate: [{ path: 'patientId', select: 'name email' }, { path: 'doctorId', select: 'name email' }] });
    res.json(queueList);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch queue list', error: error.message });
  }
};

exports.updateQueue = async (req, res) => {
  try {
    const { tokenNumber, queueStatus } = req.body;
    if (!Number.isInteger(tokenNumber) || !['waiting', 'served', 'cancelled'].includes(queueStatus)) {
      return res.status(400).json({ message: 'A token number and valid queue status are required' });
    }
    if (req.user.role === 'doctor') {
      const token = await Token.findOne({ tokenNumber }).populate('appointmentId', 'doctorId');
      if (!token) return res.status(404).json({ message: 'Token not found' });
      if (token.appointmentId.doctorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You cannot update this token' });
      }
    }
    const token = await Token.findOneAndUpdate({ tokenNumber }, { queueStatus }, { new: true });
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    const appointmentStatus = queueStatus === 'served' ? 'completed' : queueStatus === 'cancelled' ? 'cancelled' : 'confirmed';
    await Appointment.findByIdAndUpdate(token.appointmentId, { status: appointmentStatus });
    res.json(token);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update queue', error: error.message });
  }
};
