const Notification = require('../models/Notification');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

exports.sendNotification = async (req, res) => {
  try {
    const { type, to, subject, message } = req.body;
    if (!type || !to || !subject || !message) {
      return res.status(400).json({ message: 'Notification type, recipient, subject and message are required' });
    }

    const sender = req.user ? req.user.id : null;
    const notification = await Notification.create({ type, to, subject, message, sender });

    const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && nodemailer;
    if (smtpConfigured && type === 'email') {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text: message,
      });

      notification.sent = true;
      await notification.save();
      return res.json({ message: 'Notification sent and saved', notification });
    }

    res.json({ message: 'Notification saved (not sent)', notification });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send notification', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { sender: req.user.id };
    const notifications = await Notification.find(query)
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch notifications', error: error.message });
  }
};
