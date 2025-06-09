const Sponsorship = require('../models/Sponsorship');
const User = require('../models/user.model');
const { uploadFile, deleteFile } = require('../utils/fileStorage');

// Create a new sponsorship request
exports.createSponsorship = async (req, res) => {
  try {
    const { title, description, category, amount, duration } = req.body;
    const sponseeId = req.user.id;

    const [result] = await Sponsorship.createSponsorship({
      title,
      description,
      category,
      amount,
      duration,
      sponseeId,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all sponsorships for a user (as sponsee or sponsor)
exports.getUserSponsorships = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const sponsorships = await Sponsorship.getUserSponsorships(userId, req.user.role, status);
    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single sponsorship by ID
exports.getSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.getSponsorship(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to view this sponsorship
    if (
      sponsorship.sponsee_id !== req.user.id &&
      sponsorship.sponsor_id !== req.user.id &&
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
    const sponsorship = await Sponsorship.getSponsorship(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to update this sponsorship
    if (
      sponsorship.sponsee_id !== req.user.id &&
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

    const updatedSponsorship = await Sponsorship.updateSponsorship(req.params.id, updates);
    res.json(updatedSponsorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a sponsorship
exports.deleteSponsorship = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.getSponsorship(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to delete this sponsorship
    if (
      sponsorship.sponsee_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Sponsorship.deleteSponsorship(req.params.id);
    res.json({ message: 'Sponsorship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload document for a sponsorship
exports.uploadDocument = async (req, res) => {
  try {
    const sponsorship = await Sponsorship.getSponsorship(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to upload documents
    if (
      sponsorship.sponsee_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = await uploadFile(req.file);
    
    const document = {
      name: req.file.originalname,
      url: fileUrl,
      type: req.file.mimetype,
    };

    await Sponsorship.addDocument(req.params.id, document);
    const updatedSponsorship = await Sponsorship.getSponsorship(req.params.id);
    res.json(updatedSponsorship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add an update to a sponsorship
exports.addUpdate = async (req, res) => {
  try {
    const { content } = req.body;
    const sponsorship = await Sponsorship.getSponsorship(req.params.id);

    if (!sponsorship) {
      return res.status(404).json({ message: 'Sponsorship not found' });
    }

    // Check if user is authorized to add updates
    if (
      sponsorship.sponsee_id !== req.user.id &&
      sponsorship.sponsor_id !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Sponsorship.addUpdate(req.params.id, content);
    const updatedSponsorship = await Sponsorship.getSponsorship(req.params.id);
    res.json(updatedSponsorship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all available sponsorships (for sponsors to browse)
exports.getAvailableSponsorships = async (req, res) => {
  try {
    const { category, minAmount, maxAmount } = req.query;
    const filters = { category, minAmount, maxAmount };
    
    const sponsorships = await Sponsorship.getAvailableSponsorships(filters);
    res.json(sponsorships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 