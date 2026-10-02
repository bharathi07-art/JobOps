import mongoose from 'mongoose';

const MatchedJobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  match_percentage: Number,
  category: { type: String, enum: ['high', 'medium', 'low'] },
  career_url: String,
  job_url: String,
  search_url: String,
});

const AIResultSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  resume_score: Number,
  ats_score: Number,
  missing_skills: [String],
  recommendations: [String],
  matched_jobs: [MatchedJobSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AIResult', AIResultSchema);
