import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  fileName: String,
  mimeType: String,
  extractedText: String,
  fileSize: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Resume', ResumeSchema);
