import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as sponsorshipService from '../services/sponsorshipService';

const Sponsorships = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    duration: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchSponsorships();
  }, [activeTab]);

  const fetchSponsorships = async () => {
    try {
      setLoading(true);
      const status = ['pending', 'active', 'completed'][activeTab];
      const data = await sponsorshipService.getUserSponsorships(status);
      setSponsorships(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sponsorships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      amount: '',
      duration: '',
    });
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sponsorship = await sponsorshipService.createSponsorship(formData);
      
      if (selectedFile) {
        await sponsorshipService.uploadDocument(sponsorship._id, selectedFile);
      }

      handleCloseDialog();
      fetchSponsorships();
    } catch (err) {
      setError('Failed to create sponsorship. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sponsorship?')) {
      try {
        await sponsorshipService.deleteSponsorship(id);
        fetchSponsorships();
      } catch (err) {
        setError('Failed to delete sponsorship. Please try again.');
      }
    }
  };

  const handleUpdate = async (id, updateData) => {
    try {
      await sponsorshipService.updateSponsorship(id, updateData);
      fetchSponsorships();
    } catch (err) {
      setError('Failed to update sponsorship. Please try again.');
    }
  };

  const handleAddUpdate = async (id, content) => {
    try {
      await sponsorshipService.addUpdate(id, content);
      fetchSponsorships();
    } catch (err) {
      setError('Failed to add update. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Sponsorships
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Sponsorship
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pending" />
        <Tab label="Active" />
        <Tab label="Completed" />
      </Tabs>

      <Grid container spacing={3}>
        {sponsorships.map((sponsorship) => (
          <Grid item xs={12} md={6} lg={4} key={sponsorship._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {sponsorship.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {sponsorship.category}
                </Typography>
                <Typography variant="body2" paragraph>
                  {sponsorship.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${sponsorship.amount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Duration: {sponsorship.duration}
                </Typography>
                {sponsorship.status === 'active' && (
                  <Box mt={2}>
                    <Typography variant="body2" gutterBottom>
                      Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={sponsorship.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="textSecondary" align="right">
                      {sponsorship.progress}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleUpdate(sponsorship._id, { progress: sponsorship.progress + 10 })}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(sponsorship._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Sponsorship</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              name="title"
              label="Title"
              fullWidth
              margin="normal"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
            <TextField
              name="category"
              label="Category"
              fullWidth
              margin="normal"
              select
              value={formData.category}
              onChange={handleChange}
              required
            >
              <MenuItem value="education">Education</MenuItem>
              <MenuItem value="medical">Medical</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="housing">Housing</MenuItem>
            </TextField>
            <TextField
              name="amount"
              label="Amount"
              fullWidth
              margin="normal"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <TextField
              name="duration"
              label="Duration"
              fullWidth
              margin="normal"
              value={formData.duration}
              onChange={handleChange}
              required
            />
            <Button
              component="label"
              startIcon={<AttachFileIcon />}
              sx={{ mt: 2 }}
            >
              Upload Document
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Sponsorships; 