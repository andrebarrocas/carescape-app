import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: String,
  pseudonym: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 