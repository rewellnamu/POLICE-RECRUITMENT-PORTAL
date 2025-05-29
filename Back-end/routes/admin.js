import express from 'express';
import { auth, admin } from '../middleware/auth.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// Get all applicants
router.get('/applicants', auth, admin, async (req, res) => {
  const applicants = await User.find({ role: 'applicant' }).select('-password');
  res.json(applicants);
});

// Get all applications
router.get('/applications', auth, admin, async (req, res) => {
  const apps = await Application.find().populate('user', 'name email');
  res.json(apps);
});

// Update application status
router.patch('/application/:id/status', auth, admin, async (req, res) => {
  const { status } = req.body;
  const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(app);
});

// Announcements CRUD
router.get('/announcements', auth, admin, async (req, res) => {
  const anns = await Announcement.find().sort({ createdAt: -1 });
  res.json(anns);
});

router.post('/announcements', auth, admin, async (req, res) => {
  const ann = new Announcement(req.body);
  await ann.save();
  res.json(ann);
});

router.delete('/announcements/:id', auth, admin, async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Announcement deleted.' });
});

// Get single applicant
router.get('/applicants/:id', auth, admin, async (req, res) => {
  const applicant = await User.findById(req.params.id).select('-password');
  if (!applicant) return res.status(404).json({ message: 'Applicant not found.' });
  res.json(applicant);
});

// Update applicant (e.g., promote to admin)
router.patch('/applicants/:id', auth, admin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, select: '-password' });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
});

// Delete applicant
router.delete('/applicants/:id', auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Applicant deleted.' });
});

// Get single application
router.get('/applications/:id', auth, admin, async (req, res) => {
  const app = await Application.findById(req.params.id).populate('user', 'name email');
  if (!app) return res.status(404).json({ message: 'Application not found.' });
  res.json(app);
});

// Delete application
router.delete('/applications/:id', auth, admin, async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  res.json({ message: 'Application deleted.' });
});

// Update announcement
router.patch('/announcements/:id', auth, admin, async (req, res) => {
  const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ann) return res.status(404).json({ message: 'Announcement not found.' });
  res.json(ann);
});

export default router;
