exports.sendNotification = async (req, res) => {
  try {
    const { type, to, subject, message } = req.body;
    if (!type || !to || !subject || !message) {
      return res.status(400).json({ message: 'Notification type, recipient, subject and message are required' });
    }

    // This endpoint is a placeholder for future email/SMS integration.
    res.json({ message: 'Notification request received', notification: { type, to, subject, message } });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send notification', error: error.message });
  }
};
