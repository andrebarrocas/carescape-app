import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hex: {
    type: String,
    required: true,
  },
  description: String,
  season: {
    type: String,
    required: true,
    enum: ['Spring', 'Summer', 'Fall', 'Winter'],
  },
  dateCollected: {
    type: Date,
    required: true,
  },
  locationGeom: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    material: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    application: {
      type: String,
      required: true,
    },
    process: {
      type: String,
      required: true,
    },
    notes: String,
  },
  uploads: [{
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    caption: String,
  }],
});

// Add geospatial index for location queries
ColorSchema.index({ locationGeom: '2dsphere' });

export default mongoose.models.Color || mongoose.model('Color', ColorSchema); 