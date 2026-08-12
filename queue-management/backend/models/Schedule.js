const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availableDays: {
    type: [String],
    required: true,
  },
  availableSlots: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ScheduleSchema.index({ doctorId: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
