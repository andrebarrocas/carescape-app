import mongoose from 'mongoose';

const ColorTagSchema = new mongoose.Schema({
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true,
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
});

// Create a compound index to ensure unique color-tag combinations
ColorTagSchema.index({ colorId: 1, tagId: 1 }, { unique: true });

export default mongoose.models.ColorTag || mongoose.model('ColorTag', ColorTagSchema); 