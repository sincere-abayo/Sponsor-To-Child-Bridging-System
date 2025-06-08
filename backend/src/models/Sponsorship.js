const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['education', 'medical', 'business', 'housing'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  sponsee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  updates: [{
    content: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Add indexes for better query performance
sponsorshipSchema.index({ sponsee: 1, status: 1 });
sponsorshipSchema.index({ sponsor: 1, status: 1 });
sponsorshipSchema.index({ category: 1, status: 1 });

const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);

module.exports = Sponsorship; 