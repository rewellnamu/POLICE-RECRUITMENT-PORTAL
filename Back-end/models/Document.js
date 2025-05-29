import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
