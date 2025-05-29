import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import applicantRoutes from './routes/applicant.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Allow CORS from your front-end (adjust origin as needed)
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost'
  ],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Health check endpoint for browser/API testing
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error.' });
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kenya-police', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
