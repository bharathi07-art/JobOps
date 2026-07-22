import mongoose from 'mongoose';

const ProfileImageSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  imageData: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ProfileImage', ProfileImageSchema);
