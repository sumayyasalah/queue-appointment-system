const Schedule = require('../models/Schedule');

exports.createSchedule = async (req, res) => {
  try {
    const { doctorId, availableDays, availableSlots } = req.body;
    if (!doctorId || !availableDays || !availableSlots) {
      return res.status(400).json({ message: 'Doctor, available days and slots are required' });
    }

    const schedule = await Schedule.create({ doctorId, availableDays, availableSlots });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create schedule', error: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('doctorId', 'name email');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch schedules', error: error.message });
  }
};
