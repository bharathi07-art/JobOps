import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  totalAnalyses: { type: Number, default: 0 },
  lastResumeScore: Number,
  lastAtsScore: Number,
  totalJobsMatched: Number,
  totalHighMatches: Number,
  totalSavedJobs: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Analytics', AnalyticsSchema);
