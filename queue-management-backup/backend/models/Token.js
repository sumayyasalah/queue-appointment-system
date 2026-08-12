const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  queueStatus: {
    type: String,
    enum: ['waiting', 'served', 'cancelled'],
    default: 'waiting',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Token', TokenSchema);
