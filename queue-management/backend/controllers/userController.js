const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 8) {
      return res.status(400).json({ message: 'Provide a valid email and a password of at least 8 characters' });
    }
    if (!['admin', 'doctor', 'staff', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role,
    });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create user', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch users', error: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('_id name email role createdAt')
      .sort({ name: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch doctors' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch profile', error: error.message });
  }
};
