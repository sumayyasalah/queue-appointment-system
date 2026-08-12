const Appointment = require('../models/Appointment');
const Token = require('../models/Token');

const getNextTokenNumber = async () => {
  const latestToken = await Token.findOne().sort({ tokenNumber: -1 });
  return latestToken ? latestToken.tokenNumber + 1 : 1;
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, slot } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentDate || !slot) {
      return res.status(400).json({ message: 'Doctor, date and slot are required' });
    }

    const existingAppointment = await Appointment.findOne({ doctorId, appointmentDate, slot, status: { $ne: 'cancelled' } });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Slot already booked for this doctor' });
    }

    const tokenNumber = await getNextTokenNumber();
    const appointment = await Appointment.create({ patientId, doctorId, appointmentDate, slot, tokenNumber, status: 'pending' });
    await Token.create({ tokenNumber, appointmentId: appointment._id });

    res.status(201).json(appointment);
  } catch (error) {
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

    const appointments = await Appointment.find(query).populate('patientId doctorId', 'name email role');
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

    Object.assign(appointment, req.body);
    await appointment.save();
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

    appointment.status = 'cancelled';
    await appointment.save();
    await Token.findOneAndUpdate({ appointmentId: appointment._id }, { queueStatus: 'cancelled' });

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to cancel appointment', error: error.message });
  }
};
