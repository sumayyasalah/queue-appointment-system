const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
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

TokenSchema.index({ queueStatus: 1, tokenNumber: 1 });

module.exports = mongoose.model('Token', TokenSchema);
