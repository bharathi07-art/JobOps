import mongoose from 'mongoose';

const ChatQASchema = new mongoose.Schema({
  question: { type: String, required: true },
  normalizedQuestion: { type: String, required: true, unique: true },
  answer: { type: String, default: '' },
  askCount: { type: Number, default: 1 },
  answered: { type: Boolean, default: false },
  lastAsked: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ChatQA', ChatQASchema);
