import express from 'express';
import { auth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';
import User from '../models/User.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get applicant profile
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Submit application form
router.post('/application', auth, async (req, res) => {
  const existing = await Application.findOne({ user: req.user.id });
  if (existing) return res.status(400).json({ message: 'Application already submitted.' });
  const app = new Application({ user: req.user.id, data: req.body });
  await app.save();
  res.json({ message: 'Application submitted.' });
});

// Get application status
router.get('/application', auth, async (req, res) => {
  const app = await Application.findOne({ user: req.user.id });
  res.json(app);
});

// Upload document
router.post('/documents', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const doc = new Document({
    user: req.user.id,
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype
  });
  await doc.save();
  res.json({ message: 'Document uploaded.' });
});

// List documents
router.get('/documents', auth, async (req, res) => {
  const docs = await Document.find({ user: req.user.id });
  res.json(docs);
});

export default router;
