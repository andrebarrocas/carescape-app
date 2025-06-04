import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  partUsed: {
    type: String,
    required: true,
  },
  originNote: String,
});

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema); 