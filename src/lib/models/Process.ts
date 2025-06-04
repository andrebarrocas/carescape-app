import mongoose from 'mongoose';

const ProcessSchema = new mongoose.Schema({
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true,
  },
  technique: {
    type: String,
    required: true,
  },
  application: {
    type: String,
    required: true,
  },
  notes: String,
});

export default mongoose.models.Process || mongoose.model('Process', ProcessSchema); 