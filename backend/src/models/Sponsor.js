const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sponsees: [{
    sponsee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sponsorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sponsorship',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    monthlyAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    notes: String,
  }],
  totalSponsored: {
    type: Number,
    default: 0,
  },
  activeSponsorships: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Add indexes for better query performance
sponsorSchema.index({ user: 1 });
sponsorSchema.index({ 'sponsees.sponsee': 1 });
sponsorSchema.index({ 'sponsees.sponsorship': 1 });

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

module.exports = Sponsor; 