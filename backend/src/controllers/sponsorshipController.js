const Sponsorship = require('../models/Sponsorship');
const User = require('../models/User');
const { uploadFile, deleteFile } = require('../utils/fileStorage');

// Create a new sponsorship request
exports.createSponsorship = async (req, res) => {
  try {
    const { title, description, category, amount, duration } = req.body;
    const sponsee = req.user._id;

    const sponsorship = new Sponsorship({
      title,
      description,
      category,
      amount,
      duration,
      sponsee,
    });

    await sponsorship.save();
    res.status(201).json(sponsorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all sponsorships for a user (as sponsee or sponsor)
exports.getUserSponsorships = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const query = {
      $or: [{ sponsee: userId }, { sponsor: userId }],
    };

    if (status) {
      query.status = status;
    }

    const sponsorships = await Sponsorship.find(query)
      .populate('sponsee', 'name email')
      .populate('sponsor', 'name email')
      .sort({ createdAt: -1 });

    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single sponsorship by ID
exports.getSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id)
      .populate('sponsee', 'name email')
      .populate('sponsor', 'name email');

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to view this sponsorship
    if (
      sponsorship.sponsee._id.toString() !== req.user._id.toString() &&
      sponsorship.sponsor?._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(sponsorship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a sponsorship
exports.updateSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to update this sponsorship
    if (
      sponsorship.sponsee.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedUpdates = ['title', 'description', 'category', 'amount', 'duration', 'progress'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(sponsorship, updates);
    await sponsorship.save();

    res.json(sponsorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a sponsorship
exports.deleteSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to delete this sponsorship
    if (
      sponsorship.sponsee.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated documents from local storage
    if (sponsorship.documents && sponsorship.documents.length > 0) {
      await Promise.all(
        sponsorship.documents.map(doc => deleteFile(doc.url))
      );
    }

    await sponsorship.remove();
    res.json({ message: 'Sponsorship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload document for a sponsorship
exports.uploadDocument = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to upload documents
    if (
      sponsorship.sponsee.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = await uploadFile(req.file);
    
    sponsorship.documents.push({
      name: req.file.originalname,
      url: fileUrl,
      type: req.file.mimetype,
    });

    await sponsorship.save();
    res.json(sponsorship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add an update to a sponsorship
exports.addUpdate = async (req, res) => {
  try {
    const { content } = req.body;
    const sponsorship = await Sponsorship.findById(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to add updates
    if (
      sponsorship.sponsee.toString() !== req.user._id.toString() &&
      sponsorship.sponsor?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    sponsorship.updates.push({ content });
    await sponsorship.save();

    res.json(sponsorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all available sponsorships (for sponsors to browse)
exports.getAvailableSponsorships = async (req, res) => {
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
      .populate('sponsee', 'name email')
      .sort({ createdAt: -1 });

    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 