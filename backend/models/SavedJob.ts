import mongoose from 'mongoose';

const SavedJobSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  title: String,
  company: String,
  location: String,
  match_percentage: Number,
  category: { type: String, enum: ['high', 'medium', 'low'] },
  career_url: String,
  savedAt: { type: Date, default: Date.now },
});

export default mongoose.model('SavedJob', SavedJobSchema);
