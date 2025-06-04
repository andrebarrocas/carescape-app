import mongoose from 'mongoose';

const MediaUploadSchema = new mongoose.Schema({
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['landscape', 'process', 'result'],
  },
  url: {
    type: String,
    required: true,
  },
  caption: String,
});

export default mongoose.models.MediaUpload || mongoose.model('MediaUpload', MediaUploadSchema); 