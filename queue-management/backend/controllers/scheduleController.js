const Schedule = require('../models/Schedule');
const User = require('../models/User');

const weekdays = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

const normalizeSchedule = (availableDays, availableSlots) => {
  const days = availableDays.map((day) => (typeof day === 'string' ? day.trim().toLowerCase() : ''));
  const slots = availableSlots.map((slot) => (typeof slot === 'string' ? slot.trim() : ''));
  if (days.some((day) => !weekdays.has(day)) || slots.some((slot) => !slot)) return null;
  return { days: [...new Set(days)], slots: [...new Set(slots)] };
};

exports.createSchedule = async (req, res) => {
  try {
    const { doctorId, availableDays, availableSlots } = req.body;
    if (!doctorId || !availableDays || !availableSlots) {
      return res.status(400).json({ message: 'Doctor, available days and slots are required' });
    }

    const isPrivileged = ['admin', 'staff'].includes(req.user.role);
    if (!isPrivileged && (req.user.role !== 'doctor' || doctorId !== req.user.id)) {
      return res.status(403).json({ message: 'You can only manage your own schedule' });
    }
    if (!Array.isArray(availableDays) || !availableDays.length || !Array.isArray(availableSlots) || !availableSlots.length) {
      return res.status(400).json({ message: 'Available days and slots must be non-empty arrays' });
    }
    const normalizedSchedule = normalizeSchedule(availableDays, availableSlots);
    if (!normalizedSchedule) {
      return res.status(400).json({ message: 'Use full weekday names and non-empty time slots' });
    }
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(400).json({ message: 'Selected doctor does not exist' });

    const schedule = await Schedule.findOneAndUpdate(
      { doctorId },
      { availableDays: normalizedSchedule.days, availableSlots: normalizedSchedule.slots },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create schedule', error: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const query = req.query.doctorId ? { doctorId: req.query.doctorId } : {};
    const schedules = await Schedule.find(query).populate('doctorId', 'name email').sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch schedules', error: error.message });
  }
};
