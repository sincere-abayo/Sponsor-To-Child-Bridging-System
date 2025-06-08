const Sponsor = require('../models/Sponsor');
const User = require('../models/User');
const Sponsorship = require('../models/Sponsorship');

// Get all available sponsees (sponsorship requests)
exports.getAvailableSponsees = async (req, res) => {
  try {
    const { category, minAmount, maxAmount } = req.query;
    const query = { status: 'pending' };

    if (category) {
      query.category = category;
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    const sponsorships = await Sponsorship.find(query)
      .populate('sponsee', 'name email profile')
      .sort({ createdAt: -1 });

    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sponsor's dashboard data
exports.getSponsorDashboard = async (req, res) => {
  try {
    const sponsor = await Sponsor.findOne({ user: req.user._id })
      .populate({
        path: 'sponsees.sponsee',
        select: 'name email profile',
      })
      .populate({
        path: 'sponsees.sponsorship',
        select: 'title description category amount duration progress',
      });

    if (!sponsor) {
      return res.json({
        totalSponsored: 0,
        activeSponsorships: 0,
        sponsees: [],
      });
    }

    res.json(sponsor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start sponsoring a sponsee
exports.startSponsoring = async (req, res) => {
  try {
    const { sponsorshipId, monthlyAmount, notes } = req.body;
    
    // Find the sponsorship
    const sponsorship = await Sponsorship.findById(sponsorshipId);
    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    if (sponsorship.status !== 'pending') {
      return res.status(400).json({ message: 'This sponsorship is no longer available' });
    }

    // Calculate total amount based on duration
    const durationInMonths = parseInt(sponsorship.duration);
    const totalAmount = monthlyAmount * durationInMonths;

    // Find or create sponsor record
    let sponsor = await Sponsor.findOne({ user: req.user._id });
    if (!sponsor) {
      sponsor = new Sponsor({ user: req.user._id });
    }

    // Add new sponsee
    sponsor.sponsees.push({
      sponsee: sponsorship.sponsee,
      sponsorship: sponsorship._id,
      monthlyAmount,
      totalAmount,
      notes,
    });

    // Update sponsorship status
    sponsorship.status = 'active';
    sponsorship.sponsor = req.user._id;
    await sponsorship.save();

    // Update sponsor stats
    sponsor.totalSponsored += totalAmount;
    sponsor.activeSponsorships += 1;
    await sponsor.save();

    res.status(201).json(sponsor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update sponsorship status
exports.updateSponsorshipStatus = async (req, res) => {
  try {
    const { sponseeId, status } = req.body;
    
    const sponsor = await Sponsor.findOne({ user: req.user._id });
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    const sponsee = sponsor.sponsees.find(s => s.sponsee.toString() === sponseeId);
    if (!sponsee) {
      return res.status(404).json({ message: 'Sponsee not found' });
    }

    // Update status
    sponsee.status = status;
    if (status === 'completed' || status === 'cancelled') {
      sponsor.activeSponsorships -= 1;
    }

    // Update sponsorship status
    await Sponsorship.findByIdAndUpdate(sponsee.sponsorship, { status });

    await sponsor.save();
    res.json(sponsor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get sponsee details
exports.getSponseeDetails = async (req, res) => {
  try {
    const { sponseeId } = req.params;
    
    const sponsor = await Sponsor.findOne({ user: req.user._id })
      .populate({
        path: 'sponsees',
        match: { sponsee: sponseeId },
        populate: [
          { path: 'sponsee', select: 'name email profile' },
          { path: 'sponsorship', select: 'title description category amount duration progress updates documents' },
        ],
      });

    if (!sponsor || !sponsor.sponsees.length) {
      return res.status(404).json({ message: 'Sponsee not found' });
    }

    res.json(sponsor.sponsees[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add note to sponsorship
exports.addNote = async (req, res) => {
  try {
    const { sponseeId } = req.params;
    const { note } = req.body;
    
    const sponsor = await Sponsor.findOne({ user: req.user._id });
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    const sponsee = sponsor.sponsees.find(s => s.sponsee.toString() === sponseeId);
    if (!sponsee) {
      return res.status(404).json({ message: 'Sponsee not found' });
    }

    sponsee.notes = note;
    await sponsor.save();

    res.json(sponsor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 