const express = require('express');
const cors = require('cors');
const path = require('path');
const sponsorshipRoutes = require('./routes/sponsorshipRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/sponsorships', sponsorshipRoutes);
app.use('/api/sponsors', sponsorRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; 