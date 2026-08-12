const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, username, password, role = 'patient' } = req.body;
    if (!name || !password || !(email || username)) {
      return res.status(400).json({ message: 'Name, username or email, and password are required' });
    }

    let normalizedEmail = null;
    if (email) {
      normalizedEmail = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: 'A valid email is required' });
      }
    }

    const normalizedUsername = username ? username.trim() : null;
    if (normalizedUsername && normalizedUsername.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!['admin', 'doctor', 'staff', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }
    if (role !== 'patient') {
      return res.status(403).json({ message: 'Only patient accounts can be created through public registration' });
    }

    if (normalizedEmail && (await User.exists({ email: normalizedEmail }))) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (normalizedUsername && (await User.exists({ username: normalizedUsername }))) {
      return res.status(400).json({ message: 'Username already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: 'Unable to register user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const identifier = (username || email || "").trim();
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username or email and password are required' });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const user = await User.findOne(query);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If the client provided a role, enforce it matches the user's role
    if (role && user.role !== role.toLowerCase()) {
      return res.status(403).json({ message: 'User role does not match' });
    }

    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: 'Unable to login', error: error.message });
  }
};
