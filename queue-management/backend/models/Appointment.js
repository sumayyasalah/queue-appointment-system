const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  slot: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  tokenNumber: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AppointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, slot: 1 },
  {
    name: 'unique_active_doctor_slot',
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'completed'] } },
  }
);
AppointmentSchema.index({ patientId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
