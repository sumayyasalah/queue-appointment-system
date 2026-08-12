const Appointment = require('../models/Appointment');
const Token = require('../models/Token');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

const activeStatuses = ['pending', 'confirmed', 'completed'];
const appointmentStatuses = [...activeStatuses, 'cancelled'];

const normalizeDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeSlot = (value) => (typeof value === 'string' ? value.trim() : '');

const validateAvailability = async (doctorId, date, slot) => {
  const schedule = await Schedule.findOne({ doctorId });
  if (!schedule) return null;
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
  const allowedDays = schedule.availableDays.map((day) => day.trim().toLowerCase());
  if (!allowedDays.includes(weekday)) return 'The doctor is not available on this day';
  if (!schedule.availableSlots.map(normalizeSlot).includes(slot)) return 'The selected time slot is unavailable';
  return null;
};

const getNextTokenNumber = async () => {
  const latestToken = await Token.findOne().sort({ tokenNumber: -1 });
  return latestToken ? latestToken.tokenNumber + 1 : 1;
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, slot, reason } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentDate || !slot) {
      return res.status(400).json({ message: 'Doctor, date and slot are required' });
    }

    const date = normalizeDate(appointmentDate);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (!date || date < today) {
      return res.status(400).json({ message: 'Appointment date must be today or later' });
    }
    const normalizedSlot = normalizeSlot(slot);
    if (!normalizedSlot) return res.status(400).json({ message: 'A valid appointment slot is required' });

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(400).json({ message: 'Selected doctor does not exist' });
    }

    const availabilityError = await validateAvailability(doctorId, date, normalizedSlot);
    if (availabilityError) return res.status(400).json({ message: availabilityError });

    const existingAppointment = await Appointment.findOne({ doctorId, appointmentDate: date, slot: normalizedSlot, status: { $in: activeStatuses } });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Slot already booked for this doctor' });
    }

    const tokenNumber = await getNextTokenNumber();
    const appointment = await Appointment.create({ patientId, doctorId, appointmentDate: date, slot: normalizedSlot, reason: reason?.trim(), tokenNumber, status: 'pending' });
    await Token.create({ tokenNumber, appointmentId: appointment._id });

    res.status(201).json(appointment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'The appointment slot or queue token is no longer available. Please try again.' });
    }
    res.status(500).json({ message: 'Unable to create appointment', error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { role, id } = req.user;
    const query = {};

    if (role === 'patient') {
      query.patientId = id;
    } else if (role === 'doctor') {
      query.doctorId = id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId doctorId', 'name email role')
      .sort({ appointmentDate: 1, slot: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch appointments', error: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPrivileged = ['admin', 'staff'].includes(req.user.role);
    const isDoctor = req.user.role === 'doctor' && appointment.doctorId.toString() === req.user.id;
    if (!isPrivileged && !isDoctor) {
      return res.status(403).json({ message: 'You cannot update this appointment' });
    }

    if (req.body.status && !appointmentStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid appointment status' });
    }
    if (appointment.status === 'cancelled') {
      return res.status(409).json({ message: 'Cancelled appointments cannot be updated' });
    }
    if (isDoctor && req.body.status) appointment.status = req.body.status;
    if (!isDoctor) {
      if (req.body.appointmentDate !== undefined) {
        const date = normalizeDate(req.body.appointmentDate);
        if (!date) return res.status(400).json({ message: 'Appointment date must use YYYY-MM-DD format' });
        appointment.appointmentDate = date;
      }
      if (req.body.slot !== undefined) {
        const slot = normalizeSlot(req.body.slot);
        if (!slot) return res.status(400).json({ message: 'A valid appointment slot is required' });
        appointment.slot = slot;
      }
      if (req.body.reason !== undefined) appointment.reason = req.body.reason?.trim();
      if (req.body.status) appointment.status = req.body.status;
      const availabilityError = await validateAvailability(appointment.doctorId, appointment.appointmentDate, appointment.slot);
      if (availabilityError) return res.status(400).json({ message: availabilityError });
    }
    await appointment.save();
    const queueStatus = appointment.status === 'cancelled' ? 'cancelled' : appointment.status === 'completed' ? 'served' : 'waiting';
    await Token.findOneAndUpdate({ appointmentId: appointment._id }, { queueStatus });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update appointment', error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwner = req.user.role === 'patient' && appointment.patientId.toString() === req.user.id;
    if (!isOwner && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    await Token.findOneAndUpdate({ appointmentId: appointment._id }, { queueStatus: 'cancelled' });

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to cancel appointment', error: error.message });
  }
};
