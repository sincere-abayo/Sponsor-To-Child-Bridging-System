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
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as sponsorService from '../services/sponsorService';

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [availableSponsees, setAvailableSponsees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSponsee, setSelectedSponsee] = useState(null);
  const [formData, setFormData] = useState({
    monthlyAmount: '',
    notes: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchAvailableSponsees();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await sponsorService.getSponsorDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSponsees = async () => {
    try {
      const data = await sponsorService.getAvailableSponsees();
      setAvailableSponsees(data);
    } catch (err) {
      console.error('Failed to fetch available sponsees:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (sponsee) => {
    setSelectedSponsee(sponsee);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSponsee(null);
    setFormData({
      monthlyAmount: '',
      notes: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartSponsoring = async (e) => {
    e.preventDefault();
    try {
      await sponsorService.startSponsoring({
        sponsorshipId: selectedSponsee._id,
        ...formData,
      });
      handleCloseDialog();
      fetchDashboardData();
      fetchAvailableSponsees();
    } catch (err) {
      setError('Failed to start sponsoring. Please try again.');
    }
  };

  const handleUpdateStatus = async (sponseeId, newStatus) => {
    try {
      await sponsorService.updateSponsorshipStatus({
        sponseeId,
        status: newStatus,
      });
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
          Sponsor Dashboard
        </Typography>
        <Box>
          <Typography variant="h6" color="primary" component="span" sx={{ mr: 2 }}>
            Total Sponsored: ${dashboardData?.totalSponsored || 0}
          </Typography>
          <Typography variant="h6" color="secondary" component="span">
            Active Sponsorships: {dashboardData?.activeSponsorships || 0}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="My Sponsees" />
        <Tab label="Available Sponsees" />
      </Tabs>

      {activeTab === 0 ? (
        <Grid container spacing={3}>
          {dashboardData?.sponsees.map((sponsee) => (
            <Grid item xs={12} md={6} lg={4} key={sponsee._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {sponsee.sponsee.name}
                    </Typography>
                    <Chip
                      label={sponsee.status}
                      color={getStatusColor(sponsee.status)}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {sponsee.sponsorship.title}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {sponsee.sponsorship.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Monthly Amount:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ${sponsee.monthlyAmount}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Total Amount:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ${sponsee.totalAmount}
                    </Typography>
                  </Box>
                  {sponsee.status === 'active' && (
                    <Box mt={2}>
                      <Typography variant="body2" gutterBottom>
                        Progress
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={sponsee.sponsorship.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="textSecondary" align="right">
                        {sponsee.sponsorship.progress}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/messages/${sponsee.sponsee._id}`)}
                  >
                    <MessageIcon />
                  </IconButton>
                  {sponsee.status === 'active' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleUpdateStatus(sponsee.sponsee._id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {availableSponsees.map((sponsee) => (
            <Grid item xs={12} md={6} lg={4} key={sponsee._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {sponsee.sponsee.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {sponsee.category}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {sponsee.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Amount Needed:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ${sponsee.amount}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Duration:
                    </Typography>
                    <Typography variant="body2">
                      {sponsee.duration}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<MoneyIcon />}
                    onClick={() => handleOpenDialog(sponsee)}
                  >
                    Start Sponsoring
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Start Sponsoring</DialogTitle>
        <form onSubmit={handleStartSponsoring}>
          <DialogContent>
            <TextField
              name="monthlyAmount"
              label="Monthly Amount"
              fullWidth
              margin="normal"
              type="number"
              value={formData.monthlyAmount}
              onChange={handleChange}
              required
            />
            <TextField
              name="notes"
              label="Notes"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={formData.notes}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Start Sponsoring
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default SponsorDashboard; 