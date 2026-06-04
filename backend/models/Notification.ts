import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  time: string; // ISO string
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
