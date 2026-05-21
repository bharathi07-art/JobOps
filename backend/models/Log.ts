import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  action: String,        // e.g. 'resume_upload', 'ai_analyze', 'save_job'
  status: { type: String, enum: ['success', 'error'] },
  detail: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Log', LogSchema);
