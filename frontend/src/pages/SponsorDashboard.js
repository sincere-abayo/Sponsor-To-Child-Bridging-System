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
    amount: '',
    notes: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchAvailableSponsees();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        sponsorService.getSponsorDashboard(),
        sponsorService.getSponsorStats()
      ]);
      setDashboardData({ ...profileData, stats: statsData });
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
      amount: '',
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
        sponseeId: selectedSponsee.id,
        ...formData,
      });
      handleCloseDialog();
      fetchDashboardData();
      fetchAvailableSponsees();
    } catch (err) {
      setError('Failed to start sponsoring. Please try again.');
    }
  };

  const handleUpdateStatus = async (sponsorshipId, newStatus) => {
    try {
      await sponsorService.updateSponsorshipStatus(sponsorshipId, newStatus);
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
            Total Sponsored: ${dashboardData?.stats?.total_sponsored || 0}
          </Typography>
          <Typography variant="h6" color="secondary" component="span">
            Active Sponsorships: {dashboardData?.stats?.active_sponsorships || 0}
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
          {dashboardData?.sponsees?.map((sponsee) => (
            <Grid item xs={12} md={6} lg={4} key={sponsee.sponsorship_id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {sponsee.sponsee_name}
                    </Typography>
                    <Chip
                      label={sponsee.status}
                      color={getStatusColor(sponsee.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" paragraph>
                    {sponsee.notes}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Amount:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      ${sponsee.amount}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      Start Date:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(sponsee.start_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/messages/${sponsee.sponsee_id}`)}
                  >
                    <MessageIcon />
                  </IconButton>
                  {sponsee.status === 'active' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleUpdateStatus(sponsee.sponsorship_id, 'completed')}
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
            <Grid item xs={12} md={6} lg={4} key={sponsee.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {sponsee.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {sponsee.email}
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