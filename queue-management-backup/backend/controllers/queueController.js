const Token = require('../models/Token');

exports.getCurrentQueue = async (req, res) => {
  try {
    const current = await Token.findOne({ queueStatus: 'waiting' }).sort({ tokenNumber: 1 });
    res.json({ currentServing: current ? current.tokenNumber : null, waitingCount: await Token.countDocuments({ queueStatus: 'waiting' }) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch current queue', error: error.message });
  }
};

exports.getQueueList = async (req, res) => {
  try {
    const queueList = await Token.find().sort({ tokenNumber: 1 }).populate({ path: 'appointmentId', select: 'appointmentDate slot status patientId doctorId' });
    res.json(queueList);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch queue list', error: error.message });
  }
};

exports.updateQueue = async (req, res) => {
  try {
    const { tokenNumber, queueStatus } = req.body;
    const token = await Token.findOneAndUpdate({ tokenNumber }, { queueStatus }, { new: true });
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
    res.json(token);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update queue', error: error.message });
  }
};
