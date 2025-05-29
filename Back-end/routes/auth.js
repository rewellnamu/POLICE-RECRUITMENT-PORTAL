import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered.' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash });
  await user.save();
  res.json({ message: 'Registration successful.' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    console.log('Login failed: user not found for email', email);
    return res.status(400).json({ message: 'Invalid credentials.' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    console.log('Login failed: password mismatch for email', email);
    return res.status(400).json({ message: 'Invalid credentials.' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export default router;
